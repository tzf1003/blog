import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { URL } from "url";
import type { DB } from "../_worker";
import { users } from "../db/schema";
import { setup } from "../setup";
import { getDB } from "../utils/di";

/** OAuth 错误码定义 */
const OAuthErrorCode = {
    REFERER_NOT_FOUND: 'OAUTH_REFERER_NOT_FOUND',
    INVALID_REFERER: 'OAUTH_INVALID_REFERER',
    OAUTH_REDIRECT_FAILED: 'OAUTH_REDIRECT_FAILED',
    TOKEN_EXCHANGE_FAILED: 'OAUTH_TOKEN_EXCHANGE_FAILED',
    GITHUB_API_FAILED: 'OAUTH_GITHUB_API_FAILED',
    INVALID_GITHUB_USER: 'OAUTH_INVALID_GITHUB_USER',
    DB_QUERY_FAILED: 'OAUTH_DB_QUERY_FAILED',
    DB_UPDATE_FAILED: 'OAUTH_DB_UPDATE_FAILED',
    DB_INSERT_FAILED: 'OAUTH_DB_INSERT_FAILED',
    JWT_SIGN_FAILED: 'OAUTH_JWT_SIGN_FAILED',
} as const;

/** 构建错误响应 */
function buildOAuthError(code: string, message: string, details?: Record<string, unknown>) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
            timestamp: new Date().toISOString(),
        }
    };
}

/** 构建带错误信息的重定向 URL */
function buildErrorRedirectUrl(baseUrl: string, code: string, message: string): string {
    const params = new URLSearchParams({
        error: code,
        error_description: message,
    });
    return `${baseUrl}/callback?${params.toString()}`;
}

export function UserService() {
    const db: DB = getDB();
    return new Elysia({ aot: false })
        .use(setup())
        .group('/user', (group) =>
            group
                .get("/github", ({ oauth2, set, headers: { referer }, cookie: { redirect_to } }) => {
                    // 检查 Referer
                    if (!referer) {
                        set.status = 400;
                        return buildOAuthError(
                            OAuthErrorCode.REFERER_NOT_FOUND,
                            'Referer header is required for OAuth flow',
                            { hint: 'Ensure the request is initiated from a valid page' }
                        );
                    }

                    // 解析 Referer URL
                    let referer_url: URL;
                    try {
                        referer_url = new URL(referer);
                    } catch (e) {
                        set.status = 400;
                        return buildOAuthError(
                            OAuthErrorCode.INVALID_REFERER,
                            'Invalid referer URL format',
                            { referer, parseError: String(e) }
                        );
                    }

                    redirect_to.value = `${referer_url.protocol}//${referer_url.host}`;

                    // 尝试 OAuth 重定向
                    try {
                        return oauth2.redirect("GitHub", { scopes: ["read:user"] });
                    } catch (e) {
                        set.status = 500;
                        return buildOAuthError(
                            OAuthErrorCode.OAUTH_REDIRECT_FAILED,
                            'Failed to initiate GitHub OAuth redirect',
                            { 
                                error: String(e),
                                hint: 'Check if GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correctly configured'
                            }
                        );
                    }
                })
                .get("/github/callback", async ({ jwt, oauth2, set, store, query, cookie: { token, redirect_to, state } }) => {
                    const redirect_host = redirect_to.value || "";

                    console.log('[OAuth Callback] state cookie:', state.value);
                    console.log('[OAuth Callback] state query:', query.state);
                    console.log('[OAuth Callback] redirect_host:', redirect_host);

                    // Step 1: 交换 access token
                    let gh_token: { accessToken: string };
                    try {
                        gh_token = await oauth2.authorize("GitHub");
                        console.log('[OAuth Callback] Token exchange successful');
                    } catch (e) {
                        console.error('[OAuth Callback] Token exchange failed:', e);
                        if (redirect_host) {
                            set.redirect = buildErrorRedirectUrl(
                                redirect_host,
                                OAuthErrorCode.TOKEN_EXCHANGE_FAILED,
                                `Failed to exchange authorization code for access token: ${String(e)}`
                            );
                            return;
                        }
                        set.status = 500;
                        return buildOAuthError(
                            OAuthErrorCode.TOKEN_EXCHANGE_FAILED,
                            'Failed to exchange authorization code for access token',
                            { 
                                error: String(e),
                                hint: 'Check if GITHUB_CLIENT_SECRET is correct and the authorization code is valid'
                            }
                        );
                    }

                    // Step 2: 获取 GitHub 用户信息
                    let ghUser: any;
                    try {
                        const response = await fetch("https://api.github.com/user", {
                            headers: {
                                Authorization: `Bearer ${gh_token.accessToken}`,
                                Accept: "application/json",
                                "User-Agent": "elysia"
                            },
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`GitHub API returned ${response.status}: ${errorText}`);
                        }

                        ghUser = await response.json();
                        console.log('[OAuth Callback] GitHub user fetched:', { id: ghUser.id, login: ghUser.login });
                    } catch (e) {
                        console.error('[OAuth Callback] GitHub API failed:', e);
                        if (redirect_host) {
                            set.redirect = buildErrorRedirectUrl(
                                redirect_host,
                                OAuthErrorCode.GITHUB_API_FAILED,
                                `Failed to fetch user info from GitHub: ${String(e)}`
                            );
                            return;
                        }
                        set.status = 502;
                        return buildOAuthError(
                            OAuthErrorCode.GITHUB_API_FAILED,
                            'Failed to fetch user info from GitHub API',
                            { error: String(e) }
                        );
                    }

                    // Step 3: 验证 GitHub 用户数据
                    if (!ghUser.id) {
                        console.error('[OAuth Callback] Invalid GitHub user data:', ghUser);
                        if (redirect_host) {
                            set.redirect = buildErrorRedirectUrl(
                                redirect_host,
                                OAuthErrorCode.INVALID_GITHUB_USER,
                                'GitHub returned invalid user data (missing id)'
                            );
                            return;
                        }
                        set.status = 502;
                        return buildOAuthError(
                            OAuthErrorCode.INVALID_GITHUB_USER,
                            'GitHub returned invalid user data',
                            { receivedData: { hasId: !!ghUser.id, hasLogin: !!ghUser.login } }
                        );
                    }

                    const profile: {
                        openid: string;
                        username: string;
                        avatar: string;
                        permission: number | null;
                    } = {
                        openid: String(ghUser.id),
                        username: ghUser.name || ghUser.login,
                        avatar: ghUser.avatar_url,
                        permission: 0
                    };

                    // Step 4: 查询/创建用户
                    let userId: number;
                    try {
                        const existingUser = await db.query.users.findFirst({ 
                            where: eq(users.openid, profile.openid) 
                        });

                        if (existingUser) {
                            // 更新现有用户
                            console.log('[OAuth Callback] Updating existing user:', existingUser.id);
                            profile.permission = existingUser.permission;
                            await db.update(users).set(profile).where(eq(users.id, existingUser.id));
                            userId = existingUser.id;
                        } else {
                            // 创建新用户
                            console.log('[OAuth Callback] Creating new user');
                            
                            // 检查是否为第一个用户（授予管理员权限）
                            if (!await store.anyUser(db)) {
                                const realTimeCheck = (await db.query.users.findMany())?.length > 0;
                                if (!realTimeCheck) {
                                    profile.permission = 1;
                                    store.anyUser = async (_: DB) => true;
                                    console.log('[OAuth Callback] First user, granting admin permission');
                                }
                            }

                            const result = await db.insert(users).values(profile).returning({ insertedId: users.id });
                            if (!result || result.length === 0) {
                                throw new Error('Insert returned empty result');
                            }
                            userId = result[0].insertedId;
                            console.log('[OAuth Callback] New user created:', userId);
                        }
                    } catch (e) {
                        console.error('[OAuth Callback] Database operation failed:', e);
                        if (redirect_host) {
                            set.redirect = buildErrorRedirectUrl(
                                redirect_host,
                                OAuthErrorCode.DB_QUERY_FAILED,
                                `Database operation failed: ${String(e)}`
                            );
                            return;
                        }
                        set.status = 500;
                        return buildOAuthError(
                            OAuthErrorCode.DB_QUERY_FAILED,
                            'Failed to query or update user in database',
                            { error: String(e) }
                        );
                    }

                    // Step 5: 签发 JWT
                    let jwtToken: string;
                    try {
                        jwtToken = await jwt.sign({ id: userId });
                        token.set({
                            value: jwtToken,
                            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                            path: '/',
                        });
                        console.log('[OAuth Callback] JWT signed successfully');
                    } catch (e) {
                        console.error('[OAuth Callback] JWT signing failed:', e);
                        if (redirect_host) {
                            set.redirect = buildErrorRedirectUrl(
                                redirect_host,
                                OAuthErrorCode.JWT_SIGN_FAILED,
                                `Failed to sign JWT token: ${String(e)}`
                            );
                            return;
                        }
                        set.status = 500;
                        return buildOAuthError(
                            OAuthErrorCode.JWT_SIGN_FAILED,
                            'Failed to sign JWT token',
                            { 
                                error: String(e),
                                hint: 'Check if JWT_SECRET is correctly configured'
                            }
                        );
                    }

                    // Step 6: 重定向回前端
                    const redirect_url = `${redirect_host}/callback?token=${token.value}`;
                    console.log('[OAuth Callback] Redirecting to:', redirect_url);
                    set.headers = {
                        'Content-Type': 'text/html',
                    };
                    set.redirect = redirect_url;
                }, {
                    query: t.Object({
                        state: t.String(),
                        code: t.String(),
                    })
                })
                .get('/profile', async ({ set, uid }) => {
                    if (!uid) {
                        set.status = 403
                        return 'Permission denied'
                    }
                    const uid_num = parseInt(uid)
                    const user = await db.query.users.findFirst({ where: eq(users.id, uid_num) })
                    if (!user) {
                        set.status = 404
                        return 'User not found'
                    }
                    return {
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        permission: user.permission === 1,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    }
                })
        )
}
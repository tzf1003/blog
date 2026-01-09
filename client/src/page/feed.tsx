import {useContext, useEffect, useRef, useState} from "react";
import {Helmet} from "react-helmet";
import {useTranslation} from "react-i18next";
import ReactModal from "react-modal";
import Popup from "reactjs-popup";
import {Link, useLocation} from "wouter";
import {useAlert, useConfirm} from "../components/dialog";
import {HashTag} from "../components/hashtag";
import {Waiting} from "../components/loading";
import {Markdown} from "../components/markdown";
import {client} from "../utils/api";
import {ClientConfigContext} from "../state/config";
import {ProfileContext} from "../state/profile";
import {headersWithAuth} from "../utils/auth";
import {siteName} from "../utils/constants";
import {timeago} from "../utils/timeago";
import {Button} from "../components/button";
import {Tips} from "../components/tips";
import {useLoginModal} from "../hooks/useLoginModal";
import mermaid from "mermaid";
import {AdjacentSection} from "../components/adjacent_feed.tsx";

type Feed = {
  id: number;
  title: string | null;
  content: string;
  uid: number;
  createdAt: Date;
  updatedAt: Date;
  hashtags: {
    id: number;
    name: string;
  }[];
  user: {
    avatar: string | null;
    id: number;
    username: string;
  };
  pv: number;
  uv: number;
};



export function FeedPage({ id, TOC, clean }: { id: string, TOC: () => JSX.Element, clean: (id: string) => void }) {
  const { t } = useTranslation();
  const profile = useContext(ProfileContext);
  const [feed, setFeed] = useState<Feed>();
  const [error, setError] = useState<string>();
  const [headImage, setHeadImage] = useState<string>();
  const ref = useRef("");
  const [, setLocation] = useLocation();
  const { showAlert, AlertUI } = useAlert();
  const { showConfirm, ConfirmUI } = useConfirm();
  const [top, setTop] = useState<number>(0);
  const config = useContext(ClientConfigContext);
  const counterEnabled = config.get<boolean>('counter.enabled');
  function deleteFeed() {
    // Confirm
    showConfirm(
      t("article.delete.title"),
      t("article.delete.confirm"),
      () => {
        if (!feed) return;
        client
          .feed({ id: feed.id })
          .delete(null, {
            headers: headersWithAuth(),
          })
          .then(({ error }) => {
            if (error) {
              showAlert(error.value as string);
            } else {
              showAlert(t("delete.success"));
              setLocation("/");
            }
          });
      })
  }
  function topFeed() {
    const isUnTop = !(top > 0)
    const topNew = isUnTop ? 1 : 0;
    // Confirm
    showConfirm(
      isUnTop ? t("article.top.title") : t("article.untop.title"),
      isUnTop ? t("article.top.confirm") : t("article.untop.confirm"),
      () => {
        if (!feed) return;
        client
          .feed.top({ id: feed.id })
          .post({
            top: topNew,
          }, {
            headers: headersWithAuth(),
          })
          .then(({ error }) => {
            if (error) {
              showAlert(error.value as string);
            } else {
              showAlert(isUnTop ? t("article.top.success") : t("article.untop.success"));
              setTop(topNew);
            }
          });
      })
  }
  useEffect(() => {
    if (ref.current == id) return;
    setFeed(undefined);
    setError(undefined);
    setHeadImage(undefined);
    client
      .feed({ id })
      .get({
        headers: headersWithAuth(),
      })
      .then(({ data, error }) => {
        if (error) {
          setError(error.value as string);
        } else if (data && typeof data !== "string") {
          setTimeout(() => {
            setFeed(data);
            setTop(data.top);
            // Extract head image
            const img_reg = /!\[.*?\]\((.*?)\)/;
            const img_match = img_reg.exec(data.content);
            if (img_match) {
              setHeadImage(img_match[1]);
            }
            clean(id);
          }, 0);
        }
      });
    ref.current = id;
  }, [id]);
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
    });
    mermaid.run({
      suppressErrors: true,
      nodes: document.querySelectorAll("pre.mermaid_default")
    }).then(()=>{
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
      });
      mermaid.run({
        suppressErrors: true,
        nodes: document.querySelectorAll("pre.mermaid_dark")
      });
    })
  }, [feed]);

  return (
    <Waiting for={feed || error}>
      {feed && (
        <Helmet>
          <title>{`${feed.title ?? "Unnamed"} - ${process.env.NAME}`}</title>
          <meta property="og:site_name" content={siteName} />
          <meta property="og:title" content={feed.title ?? ""} />
          <meta property="og:image" content={headImage ?? process.env.AVATAR} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={document.URL} />
          <meta
            name="og:description"
            content={
              feed.content.length > 200
                ? feed.content.substring(0, 200)
                : feed.content
            }
          />
          <meta name="author" content={feed.user.username} />
          <meta
            name="keywords"
            content={feed.hashtags.map(({ name }) => name).join(", ")}
          />
          <meta
            name="description"
            content={
              feed.content.length > 200
                ? feed.content.substring(0, 200)
                : feed.content
            }
          />
        </Helmet>
      )}
      <div className="w-full flex justify-center animate-fade-in">
        {error && (
          <div className="flex flex-col wauto glass-strong rounded-2xl m-4 p-8 items-center justify-center gap-4 shadow-deep">
            <h1 className="text-2xl font-heading font-semibold t-primary">{error}</h1>
            {error === "Not found" && id === "about" && (
              <Tips value={t("about.notfound")} />
            )}
            <Button
              title={t("index.back")}
              onClick={() => (window.location.href = "/")}
            />
          </div>
        )}
        {feed && !error && (
          <>
            <div className="xl:w-64" />
            <main className="wauto">
              <article
                className="glass-strong rounded-2xl m-4 px-6 sm:px-10 md:px-14 py-10 md:py-14 shadow-light"
                aria-label={feed.title ?? "Unnamed"}
              >
                <header className="flex justify-between items-start mb-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-3 mb-4">
                      <p
                        className="t-muted text-sm flex items-center gap-1"
                        title={new Date(feed.createdAt).toLocaleString()}
                      >
                        <i className="ri-calendar-line"></i>
                        {t("feed_card.published$time", {
                          time: timeago(feed.createdAt),
                        })}
                      </p>

                      {feed.createdAt !== feed.updatedAt && (
                        <p
                          className="t-muted text-sm flex items-center gap-1"
                          title={new Date(feed.updatedAt).toLocaleString()}
                        >
                          <i className="ri-refresh-line"></i>
                          {t("feed_card.updated$time", {
                            time: timeago(feed.updatedAt),
                          })}
                        </p>
                      )}
                      
                      {counterEnabled && (
                        <p className='t-muted text-sm flex items-center gap-2'>
                          <span className="flex items-center gap-1">
                            <i className="ri-eye-line"></i>
                            {feed.pv}
                          </span>
                          <span>|</span>
                          <span className="flex items-center gap-1">
                            <i className="ri-user-line"></i>
                            {feed.uv}
                          </span>
                        </p>
                      )}
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-heading font-bold t-primary break-words leading-tight">
                      {feed.title}
                    </h1>
                  </div>
                  
                  {profile?.permission && (
                    <div className="flex gap-2 ml-4">
                      <button
                        aria-label={top > 0 ? t("untop.title") : t("top.title")}
                        onClick={topFeed}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer
                          ${top > 0 
                            ? "bg-theme text-slate-900 shadow-glow" 
                            : "glass hover:bg-slate-100 dark:hover:bg-slate-800 t-secondary"
                          }`}
                      >
                        <i className="ri-pushpin-line" />
                      </button>
                      <Link
                        aria-label={t("edit")}
                        href={`/writing/${feed.id}`}
                        className="w-9 h-9 flex items-center justify-center rounded-lg glass hover:bg-slate-100 dark:hover:bg-slate-800 t-secondary transition-all duration-200 cursor-pointer"
                      >
                        <i className="ri-edit-2-line" />
                      </Link>
                      <button
                        aria-label={t("delete.title")}
                        onClick={deleteFeed}
                        className="w-9 h-9 flex items-center justify-center rounded-lg glass hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                      >
                        <i className="ri-delete-bin-7-line text-red-500" />
                      </button>
                    </div>
                  )}
                </header>
                
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-semibold prose-a:text-theme prose-a:no-underline hover:prose-a:underline prose-lg">
                  <Markdown content={feed.content} />
                </div>
                
                <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-5">
                  {feed.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {feed.hashtags.map(({ name }, index) => (
                        <HashTag key={index} name={name} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <img
                      src={feed.user.avatar || "/avatar.png"}
                      className="w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                      alt={feed.user.username}
                      loading="lazy"
                    />
                    <div>
                      <span className="t-primary font-medium block text-base">
                        {feed.user.username}
                      </span>
                      <span className="t-muted text-sm">
                        Author
                      </span>
                    </div>
                  </div>
                </footer>
              </article>
              <AdjacentSection id={id} setError={setError}/>
              {feed && <Comments id={`${feed.id}`} />}
              <div className="h-16" />
            </main>
            <div className="w-80 hidden lg:block relative">
              <div className="start-0 end-0 top-24 sticky">
                <TOC />
              </div>
            </div>
          </>
        )}
      </div>
      <AlertUI />
      <ConfirmUI />
    </Waiting>
  );
}

export function TOCHeader({ TOC }: { TOC: () => JSX.Element }) {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpened(true)}
        className="w-9 h-9 rounded-lg flex items-center justify-center t-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
      >
        <i className="ri-menu-2-fill ri-lg"></i>
      </button>
      <ReactModal
        isOpen={isOpened}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "0",
            border: "none",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
          },
        }}
        onRequestClose={() => setIsOpened(false)}
      >
        <div className="w-[85vw] sm:w-[70vw] lg:w-[50vw] glass-strong rounded-2xl p-6 shadow-deep animate-slide-up overflow-auto max-h-[80vh]">
          <TOC />
        </div>
      </ReactModal>
    </div>
  );
}

function CommentInput({
  id,
  onRefresh,
}: {
  id: string;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const { showAlert, AlertUI } = useAlert();
  const profile = useContext(ProfileContext);
  const { LoginModal, setIsOpened } = useLoginModal()
  function errorHumanize(error: string) {
    if (error === "Unauthorized") return t("login.required");
    else if (error === "Content is required") return t("comment.empty");
    return error;
  }
  function submit() {
    if (!profile) {
      setIsOpened(true)
      return;
    }
    client.feed
      .comment({ feed: id })
      .post(
        { content },
        {
          headers: headersWithAuth(),
        }
      )
      .then(({ error }) => {
        if (error) {
          setError(errorHumanize(error.value as string));
        } else {
          setContent("");
          setError("");
          showAlert(t("comment.success"), () => {
            onRefresh();
          });
        }
      });
  }
  return (
      <div className="w-full glass-strong rounded-2xl t-primary p-8 m-4 shadow-light">
      <div className="flex flex-col w-full items-start mb-6">
        <h3 className="text-xl font-heading font-semibold t-primary">{t("comment.title")}</h3>
      </div>
      {profile ? (<>
        <textarea
          id="comment"
          placeholder={t("comment.placeholder.title")}
          className="glass w-full min-h-32 rounded-xl p-4 t-primary placeholder:t-muted focus:outline-none focus:ring-2 focus:ring-theme/50 transition-all duration-200 resize-y"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end mt-4">
          <button
            className="btn-primary"
            onClick={submit}
          >
            {t("comment.submit")}
          </button>
        </div>
      </>) : (
        <div className="flex items-center justify-center w-full py-12">
          <button
            className="btn-primary"
            onClick={() => setIsOpened(true)}
          >
            {t("login.required")}
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-3 px-1">{error}</p>}
      <AlertUI />
      <LoginModal />
    </div>
  );
}

type Comment = {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    avatar: string | null;
    permission: number | null;
  };
};

function Comments({ id }: { id: string }) {
  const config = useContext(ClientConfigContext);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string>();
  const ref = useRef("");
  const { t } = useTranslation();

  function loadComments() {
    client.feed
      .comment({ feed: id })
      .get({
        headers: headersWithAuth(),
      })
      .then(({ data, error }) => {
        if (error) {
          setError(error.value as string);
        } else if (data && Array.isArray(data)) {
          setComments(data);
        }
      });
  }
  useEffect(() => {
    if (ref.current == id) return;
    loadComments();
    ref.current = id;
  }, [id]);
  return (
    <>
      {config.get<boolean>('comment.enabled') &&
        <div className="m-4 flex flex-col justify-center items-center gap-4">
          <CommentInput id={id} onRefresh={loadComments} />
          {error && (
            <div className="flex flex-col w-full glass-strong rounded-2xl t-primary p-8 items-center justify-center gap-4 shadow-light">
              <h3 className="text-lg font-heading font-semibold t-primary">{error}</h3>
              <button
                className="btn-primary"
                onClick={loadComments}
              >
                {t("reload")}
              </button>
            </div>
          )}
          {comments.length > 0 && (
            <div className="w-full flex flex-col gap-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onRefresh={loadComments}
                />
              ))}
            </div>
          )}
        </div>
      }
    </>
  );
}

function CommentItem({
  comment,
  onRefresh,
}: {
  comment: Comment;
  onRefresh: () => void;
}) {
  const { showConfirm, ConfirmUI } = useConfirm();
  const { showAlert, AlertUI } = useAlert();
  const { t } = useTranslation();
  const profile = useContext(ProfileContext);
  function deleteComment() {
    showConfirm(
      t("delete.comment.title"),
      t("delete.comment.confirm"),
      async () => {
        client
          .comment({ id: comment.id })
          .delete(null, {
            headers: headersWithAuth(),
          })
          .then(({ error }) => {
            if (error) {
              showAlert(error.value as string);
            } else {
              showAlert(t("delete.success"), () => {
                onRefresh();
              });
            }
          });
      })
  }
  return (
    <div className="flex items-start gap-3 glass rounded-xl p-5 transition-all duration-200 hover:shadow-light">
      <img
        src={comment.user.avatar || ""}
        className="w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex-shrink-0"
        alt={comment.user.username}
        loading="lazy"
      />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="t-primary text-base font-semibold">
            {comment.user.username}
          </span>
          <div className="flex items-center gap-2">
            <span
              title={new Date(comment.createdAt).toLocaleString()}
              className="t-muted text-sm"
            >
              {timeago(comment.createdAt)}
            </span>
            {(profile?.permission || profile?.id == comment.user.id) && (
              <Popup
                arrow={false}
                trigger={
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer">
                    <i className="ri-more-fill t-secondary"></i>
                  </button>
                }
                position="left center"
              >
                <div className="glass-strong rounded-xl p-2 shadow-deep animate-fade-in">
                  <button
                    onClick={deleteComment}
                    aria-label={t("delete.comment.title")}
                    className="w-full px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <i className="ri-delete-bin-2-line text-red-500"></i>
                    <span className="text-red-500 text-sm">{t("delete.comment.title")}</span>
                  </button>
                </div>
              </Popup>
            )}
          </div>
        </div>
        <p className="t-secondary break-words leading-relaxed">{comment.content}</p>
      </div>
      <ConfirmUI />
      <AlertUI />
    </div>
  );
}

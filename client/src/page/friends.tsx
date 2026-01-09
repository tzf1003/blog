import i18next from "i18next";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Helmet } from 'react-helmet';
import { useTranslation } from "react-i18next";
import Modal from 'react-modal';
import Select from 'react-select';
import { ShowAlertType, useAlert, useConfirm } from "../components/dialog";
import { Input } from "../components/input";
import { Waiting } from "../components/loading";
import { client } from "../utils/api";
import { ClientConfigContext } from "../state/config";
import { ProfileContext } from "../state/profile";
import { headersWithAuth } from "../utils/auth";
import { siteName } from "../utils/constants";
import { useReducedMotion } from "../hooks/useReducedMotion";


type FriendItem = {
    name: string;
    id: number;
    uid: number;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    desc: string | null;
    url: string;
    accepted: number;
    health: string;
    sort_order?: number;
};

async function publish({ name, avatar, desc, url, showAlert }: { name: string, avatar: string, desc: string, url: string, showAlert: ShowAlertType }) {
    const t = i18next.t
    const { error } = await client.friend.index.post({
        avatar,
        name,
        desc,
        url
    }, {
        headers: headersWithAuth()
    })
    if (error) {
        showAlert(error.value as string)
    } else {
        showAlert(t('create.success'), () => {
            window.location.reload()
        })
    }
}

export function FriendsPage() {
    const { t } = useTranslation()
    const config = useContext(ClientConfigContext)
    const prefersReducedMotion = useReducedMotion()
    const [apply, setApply] = useState<FriendItem>()
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")
    const [avatar, setAvatar] = useState("")
    const [url, setUrl] = useState("")
    const profile = useContext(ProfileContext);
    const [friendsAvailable, setFriendsAvailable] = useState<FriendItem[]>([])
    const [waitList, setWaitList] = useState<FriendItem[]>([])
    const [refusedList, setRefusedList] = useState<FriendItem[]>([])
    const [friendsUnavailable, setFriendsUnavailable] = useState<FriendItem[]>([])
    const [status, setStatus] = useState<'idle' | 'loading'>('loading')
    const ref = useRef(false)
    const { showAlert, AlertUI } = useAlert()
    
    useEffect(() => {
        if (ref.current) return
        client.friend.index.get({
            headers: headersWithAuth()
        }).then(({ data }) => {
            if (data) {
                const friends_available = data.friend_list?.filter(({ health, accepted }) => health.length === 0 && accepted === 1) || []
                setFriendsAvailable(friends_available)
                const friends_unavailable = data.friend_list?.filter(({ health, accepted }) => health.length > 0 && accepted === 1) || []
                setFriendsUnavailable(friends_unavailable)
                const waitList = data.friend_list?.filter(({ accepted }) => accepted === 0) || []
                setWaitList(waitList)
                const refuesdList = data.friend_list?.filter(({ accepted }) => accepted === -1) || []
                setRefusedList(refuesdList)
                if (data.apply_list)
                    setApply(data.apply_list)
            }
            setStatus('idle')
        })
        ref.current = true
    }, [])
    
    function publishButton() {
        publish({ name, desc, avatar, url, showAlert })
    }
    
    return (<>
        <Helmet>
            <title>{`${t('friends.title')} - ${process.env.NAME}`}</title>
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={t('friends.title')} />
            <meta property="og:image" content={process.env.AVATAR} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={document.URL} />
        </Helmet>
        <Waiting for={friendsAvailable.length !== 0 || friendsUnavailable.length !== 0 || status === "idle"}>
            <main className={`w-full flex flex-col justify-center items-center mb-8 t-primary ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}>
                {/* 页面标题 */}
                <div className="wauto text-start py-8">
                    <h1 className={`text-5xl font-heading font-bold t-primary mb-3 ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}>
                        {t('friends.title')}
                    </h1>
                </div>
                
                <FriendList title={t('friends.title')} show={friendsAvailable.length > 0} friends={friendsAvailable} />
                <FriendList title={t('friends.left')} show={friendsUnavailable.length > 0} friends={friendsUnavailable} />
                <FriendList title={t('friends.review.waiting')} show={waitList.length > 0} friends={waitList} />
                <FriendList title={t('friends.review.rejected')} show={refusedList.length > 0} friends={refusedList} />
                <FriendList title={t('friends.my_apply')} show={profile?.permission !== true && apply !== undefined} friends={apply ? [apply] : []} />
                
                {/* 申请/创建表单 */}
                {profile && (profile.permission || config.get("friend_apply_enable")) &&
                    <div className="wauto mt-8">
                        <div className="md:w-1/2 glass-medium rounded-2xl p-6 shadow-light">
                            <h2 className="text-xl font-heading font-semibold t-primary mb-4 flex items-center gap-2">
                                <i className="ri-user-add-line text-cyber-green"></i>
                                {profile.permission ? t('friends.create') : t('friends.apply')}
                            </h2>
                            <div className="space-y-3">
                                <Input value={name} setValue={setName} placeholder={t('sitename')} />
                                <Input value={desc} setValue={setDesc} placeholder={t('description')} />
                                <Input value={avatar} setValue={setAvatar} placeholder={t('avatar.url')} />
                                <Input value={url} setValue={setUrl} placeholder={t('url')} />
                                <div className='flex justify-center pt-2'>
                                    <button 
                                        onClick={publishButton} 
                                        className='btn-primary w-full md:w-auto'
                                    >
                                        {t('create.title')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </main>
        </Waiting>
        <AlertUI />
    </>)
}

function FriendList({ title, show, friends }: { title: string, show: boolean, friends: FriendItem[] }) {
    const prefersReducedMotion = useReducedMotion()
    
    return (<>
        {show && <>
            <div className="wauto text-start py-4">
                <p className="text-sm t-muted font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-green"></span>
                    {title}
                </p>
            </div>
            <div className="wauto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {friends.map((friend, index) => (
                    <div 
                        key={friend.id}
                        className={!prefersReducedMotion ? 'animate-fade-in' : ''}
                        style={{ 
                            animationDelay: !prefersReducedMotion ? `${index * 50}ms` : '0ms',
                            animationFillMode: 'forwards',
                        }}
                    >
                        <Friend friend={friend} />
                    </div>
                ))}
            </div>
        </>}
    </>)
}

function Friend({ friend }: { friend: FriendItem }) {
    const { t } = useTranslation()
    const profile = useContext(ProfileContext)
    const prefersReducedMotion = useReducedMotion()
    const [avatar, setAvatar] = useState(friend.avatar)
    const [name, setName] = useState(friend.name)
    const [desc, setDesc] = useState(friend.desc || "")
    const [url, setUrl] = useState(friend.url)
    const [status, setStatus] = useState(friend.accepted)
    const [sortOrder, setSortOrder] = useState(friend.sort_order || 0)
    const [modalIsOpen, setIsOpen] = useState(false);
    const { showConfirm, ConfirmUI } = useConfirm()
    const { showAlert, AlertUI } = useAlert()

    const deleteFriend = useCallback(() => {
        showConfirm(
            t('delete.title'),
            t('delete.confirm'),
            () => {
                client.friend({ id: friend.id }).delete(friend.id, {
                    headers: headersWithAuth()
                }).then(({ error }) => {
                    if (error) {
                        showAlert(error.value as string)
                    } else {
                        showAlert(t('delete.success'), () => {
                            window.location.reload()
                        })
                    }
                })
            })
    }, [friend.id, showAlert, showConfirm, t])

    const updateFriend = useCallback(() => {
        client.friend({ id: friend.id }).put({
            avatar,
            name,
            desc,
            url,
            accepted: status,
            sort_order: sortOrder
        }, {
            headers: headersWithAuth()
        }).then(({ error }) => {
            if (error) {
                showAlert(error.value as string)
            } else {
                showAlert(t('update.success'), () => {
                    window.location.reload()
                })
            }
        })
    }, [avatar, name, desc, url, status, sortOrder, friend.id, showAlert, t])

    const statusOption = [
        { value: -1, label: t('friends.review.rejected') },
        { value: 0, label: t('friends.review.waiting') },
        { value: 1, label: t('friends.review.accepted') }
    ]
    
    return (
        <>
            <a 
                title={friend.name} 
                href={friend.url} 
                target="_blank" 
                className={`
                    group glass-medium w-full rounded-xl p-4 
                    flex flex-col justify-center items-center relative
                    transition-all duration-300
                    hover:shadow-glow-sm hover:border-cyber-green/20 hover:scale-[1.02]
                `}
            >
                <div className="w-16 h-16 mb-3">
                    <img 
                        className={`
                            w-full h-full rounded-full object-cover
                            border-2 border-slate-200 dark:border-slate-700
                            transition-all duration-300
                            group-hover:border-cyber-green group-hover:shadow-glow-sm
                            ${friend.health.length > 0 ? "grayscale opacity-60" : ""}
                        `} 
                        src={friend.avatar} 
                        alt={friend.name} 
                    />
                </div>
                <p className="text-base font-medium text-center t-primary group-hover:text-cyber-green transition-colors duration-200">
                    {friend.name}
                </p>
                {friend.health.length == 0 && (
                    <p className="text-sm t-muted text-center line-clamp-2 mt-1">{friend.desc}</p>
                )}
                {friend.accepted !== 1 && (
                    <span className={`
                        mt-2 px-2 py-0.5 rounded-full text-xs font-medium
                        ${friend.accepted === 0 
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                            : "bg-red-500/10 text-red-500"
                        }
                    `}>
                        {statusOption[friend.accepted + 1].label}
                    </span>
                )}
                {friend.health.length > 0 && (
                    <p className="text-xs text-red-500 text-center mt-2">{errorHumanize(friend.health)}</p>
                )}
                {(profile?.permission || profile?.id === friend.uid) && (
                    <button 
                        onClick={(e) => { e.preventDefault(); setIsOpen(true) }} 
                        className={`
                            absolute top-2 right-2 w-8 h-8 
                            flex items-center justify-center rounded-lg
                            glass t-secondary
                            transition-all duration-200
                            hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyber-green
                            opacity-0 group-hover:opacity-100
                        `}
                    >
                        <i className="ri-settings-3-line"></i>
                    </button>
                )}
            </a>

            <Modal
                isOpen={modalIsOpen}
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '0',
                        border: 'none',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'transparent',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        zIndex: 1000
                    }
                }}
                onRequestClose={() => setIsOpen(false)}
                contentLabel={t('update$sth', { sth: friend.name })}
            >
                <div className={`w-[80vw] sm:w-[60vw] md:w-[50vw] lg:w-[40vw] xl:w-[30vw] glass-strong rounded-2xl p-6 shadow-glow ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}>
                    <div className="flex flex-col items-center mb-4">
                        <img 
                            className={`w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 ${friend.health.length > 0 ? "grayscale" : ""}`} 
                            src={friend.avatar} 
                            alt={friend.name} 
                        />
                        <h2 className="text-lg font-heading font-semibold t-primary mt-2">{friend.name}</h2>
                    </div>
                    
                    {profile?.permission && (
                        <div className="space-y-3 mb-4 p-3 glass rounded-xl">
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm t-secondary">{t('status')}</span>
                                <Select 
                                    options={statusOption} 
                                    required 
                                    defaultValue={statusOption[friend.accepted + 1]}
                                    onChange={(newValue) => {
                                        const value = newValue?.value
                                        if (value !== undefined) {
                                            setStatus(value)
                                        }
                                    }}
                                    className="w-40"
                                />
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <span className="text-sm t-secondary">{t('sort_order')}</span>
                                <Input
                                    value={sortOrder.toString()} 
                                    setValue={(val) => setSortOrder(parseInt(val) || 0)} 
                                    placeholder={t('sort_order')}
                                    className="w-40"
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <Input value={name} setValue={setName} placeholder={t('sitename')} />
                        <Input value={desc} setValue={setDesc} placeholder={t('description')} />
                        <Input value={avatar} setValue={setAvatar} placeholder={t('avatar.url')} />
                        <Input value={url} setValue={setUrl} placeholder={t('url')} />
                    </div>
                    
                    <div className='flex justify-center gap-3 mt-4'>
                        <button onClick={deleteFriend} className="btn-danger">
                            {t('delete.title')}
                        </button>
                        <button onClick={updateFriend} className="btn-primary">
                            {t('save')}
                        </button>
                    </div>
                </div>
            </Modal>
            <ConfirmUI />
            <AlertUI />
        </>
    )
}

function errorHumanize(error: string) {
    if (error === "certificate has expired" || error == "526") {
        return "证书已过期"
    } else if (error.includes("Unable to connect") || error == "521" || error == "522") {
        return "无法访问"
    }
    return error
}

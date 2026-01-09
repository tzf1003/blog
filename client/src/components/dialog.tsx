import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { Button, ButtonWithLoading } from "./button";

export type Confirm = {
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
}

export type Alert = {
    message: string;
    onConfirm: () => void;
}

export type ShowAlertType = (msg: string, onConfirm?: () => (Promise<void> | void)) => void;

export function useAlert() {
    const [alert, setAlert] = useState<Alert | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const close = () => {
        alert?.onConfirm()
        setIsOpen(false)
        setAlert(null)
    }
    const showAlert = (alert: string, onConfirm?: () => void) => {
        setAlert({
            message: alert,
            onConfirm: onConfirm ?? (() => { })
        })
        setIsOpen(true)
    }
    const { t } = useTranslation()
    const AlertUI = () => (
        <Modal isOpen={isOpen}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            onRequestClose={close}
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
                    maxWidth: '40em'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000
                }
            }}
        >
            <div className="flex flex-col items-start p-6 glass-strong space-y-4 w-full min-w-56 sm:min-w-96 shadow-deep animate-slide-up">
                <h1 className="text-2xl font-heading font-semibold t-primary">
                    {t("alert")}
                </h1>
                <p className="text-base t-secondary">
                    {alert?.message}
                </p>
                <div className="w-full flex justify-center mt-2">
                    <Button onClick={close} title={t('confirm')} />
                </div>
            </div>
        </Modal>
    )
    return { showAlert, close, AlertUI }
}

export function useConfirm() {
    const [confirm, setConfirm] = useState<Confirm | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false);
    const close = () => {
        setConfirm(null)
        setIsOpen(false)
    }
    const showConfirm = (title: string, message: string, onConfirm?: () => Promise<void> | void) => {
        setConfirm({
            title,
            message,
            onConfirm: onConfirm ?? (() => { })
        })
        setIsOpen(true)
    }
    const { t } = useTranslation()
    const ConfirmUI = () => (
        <Modal isOpen={isOpen}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            onRequestClose={close}
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
                    maxWidth: '40em'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000
                }
            }}
        >
            <div className="flex flex-col items-start p-6 glass-strong space-y-4 w-full min-w-56 sm:min-w-96 shadow-deep animate-slide-up">
                <h1 className="text-2xl font-heading font-semibold t-primary">
                    {confirm?.title}
                </h1>
                <p className="text-base t-secondary">
                    {confirm?.message}
                </p>
                <div className="w-full flex items-center justify-center gap-3 mt-2">
                    <ButtonWithLoading
                        loading={loading}
                        onClick={async () => {
                            setLoading(true);
                            await confirm?.onConfirm();
                            setLoading(false);
                            setIsOpen(false);
                        }}
                        title={t('confirm')} />
                    <Button secondary onClick={close} title={t('cancel')} />
                </div>
            </div>
        </Modal>
    )
    return { showConfirm, close, ConfirmUI }
}
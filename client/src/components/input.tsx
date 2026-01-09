
export function Input({ autofocus, value, setValue, className, placeholder, onSubmit }:
    { autofocus?: boolean, value: string, className?: string, placeholder: string, id?: number, setValue: (v: string) => void, onSubmit?: () => void }) {
    return (<input
        autoFocus={autofocus}
        placeholder={placeholder}
        value={value}
        onKeyDown={(event) => {
            if (event.key === 'Enter' && onSubmit) {
                onSubmit()
            }
        }}
        onChange={(event) => {
            setValue(event.target.value)
        }}
        className={'glass w-full py-2.5 px-4 rounded-lg t-primary placeholder:t-muted focus:outline-none focus:ring-2 focus:ring-theme/50 transition-all duration-200 ' + className} />
    )
}

export function Checkbox({ value, setValue, className, placeholder }:
    { value: boolean, className?: string, placeholder: string, id: string, setValue: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (<input type='checkbox'
        placeholder={placeholder}
        checked={value}
        onChange={(event) => {
            setValue(event.target.checked)
        }}
        className={'w-4 h-4 rounded border-slate-300 text-theme focus:ring-theme focus:ring-2 transition-colors duration-200 cursor-pointer ' + className} />
    )
}
export default function LoadingSpinner({ message = 'Loading…' }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400">{message}</p>
        </div>
    )
}

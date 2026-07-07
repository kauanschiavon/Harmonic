export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Sim",
    cancelLabel = "Não",
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!open) return null;

    return (
        <div style={s.overlay} onClick={onCancel}>
            <div style={s.card} onClick={(e) => e.stopPropagation()}>
                <h3 style={s.title}>{title}</h3>
                <p style={s.message}>{message}</p>
                <div style={s.actions}>
                    <button style={s.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
                    <button style={s.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    overlay: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    },
    card: {
        background: "#fff", borderRadius: 16, padding: 24, width: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontFamily: "Inter, sans-serif",
    },
    title: { fontSize: 18, fontWeight: 800, color: "#111", margin: "0 0 8px" },
    message: { fontSize: 14, color: "#555", margin: "0 0 20px", lineHeight: 1.5 },
    actions: { display: "flex", gap: 10, justifyContent: "flex-end" },
    cancelBtn: {
        border: "1px solid #ddd", background: "#fff", borderRadius: 8, padding: "8px 18px",
        cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111",
    },
    confirmBtn: {
        border: "1px solid #d44800", background: "#d44800", borderRadius: 8, padding: "8px 18px",
        cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#fff",
    },
};

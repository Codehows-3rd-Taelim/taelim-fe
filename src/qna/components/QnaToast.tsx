interface Props {
  message: string | null;
  position: "bottom-right" | "top-center";
}

export default function QnaToast({ message, position }: Props) {
  if (!message) return null;

  const positionClass =
    position === "bottom-right"
      ? "fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded"
      : "fixed top-[22%] left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded shadow";

  return <div className={positionClass}>{message}</div>;
}

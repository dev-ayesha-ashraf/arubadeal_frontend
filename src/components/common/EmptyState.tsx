export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-20 text-gray-500">
      <p>{text}</p>
    </div>
  );
}

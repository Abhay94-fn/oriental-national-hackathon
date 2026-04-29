export function SubjectSelector({ subject, setSubject }: { subject: string, setSubject: (s: string) => void }) {
  const subjects = ['General', 'Physics', 'Chemistry', 'Maths', 'Biology'];

  return (
    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
      {subjects.map(s => (
        <button
          key={s}
          onClick={() => setSubject(s)}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
            subject === s 
              ? 'bg-teal-400 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)]' 
              : 'bg-surface border border-border text-muted hover:text-foreground hover:border-muted'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

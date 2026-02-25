// Componente simples de Donut para reutilizar nos cards
export const MiniDonut = ({ percent, colorClass }: { percent: number, colorClass: string }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
         <circle
           cx="24" cy="24" r={radius}
           stroke="currentColor" strokeWidth="5" fill="transparent"
           className="text-gray-800"
         />
         <circle
           cx="24" cy="24" r={radius}
           stroke="currentColor" strokeWidth="5" fill="transparent"
           strokeDasharray={circumference}
           strokeDashoffset={strokeDashoffset}
           strokeLinecap="round"
           className={`${colorClass} transition-all duration-1000 ease-out`}
         />
      </svg>
    </div>
  );
};
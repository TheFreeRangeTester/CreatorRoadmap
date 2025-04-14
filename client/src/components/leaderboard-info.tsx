export default function LeaderboardInfo() {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-800">Top Ideas</h2>
        <p className="text-sm text-neutral-500">Vote for your favorite ideas or submit your own</p>
      </div>
      <div className="bg-neutral-100 rounded-lg p-2">
        <div className="flex space-x-2 text-sm font-medium">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
            Up
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
            Down
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-neutral-500 mr-1"></span>
            Same
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-primary mr-1"></span>
            New
          </span>
        </div>
      </div>
    </div>
  );
}

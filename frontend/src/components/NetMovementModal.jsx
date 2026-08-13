import { X } from "lucide-react";

const NetMovementModal = ({ metrics, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg">Net Movement Breakdown</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-between">
            <span>Purchases</span>
            <span className="font-semibold">+{metrics.purchases}</span>
          </div>

          <div className="flex justify-between">
            <span>Transfers In</span>
            <span className="text-green-600 font-semibold">
              +{metrics.transfersIn}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Transfers Out</span>
            <span className="text-red-600 font-semibold">
              -{metrics.transfersOut}
            </span>
          </div>

          <hr />

          <div className="flex justify-between font-bold">
            <span>Net Movement</span>
            <span>{metrics.netMovement}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetMovementModal;

import { motion } from "framer-motion";

const SelectedMenu = ({ items, onDelete, onUpdateQuantity }) => {
  if (!items || items.length === 0) {
    return <div className="text-gray-500 mt-4">No items selected</div>;
  }

  return (
    <div className="space-y-4 mt-4 md:mt-6">
      <h3 className="text-lg font-semibold text-gray-800 px-2 md:px-0">Menu Dipilih</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 gap-2 sm:gap-0"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
              <span className="font-medium text-gray-800 text-sm md:text-base">{item.name}</span>
              <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto">
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg touch-manipulation"
                    disabled={(item.quantity || 1) <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="w-8 text-center text-sm md:text-base">{item.quantity || 1}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg touch-manipulation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <span className="font-medium text-gray-600 min-w-[80px] sm:min-w-[100px] text-right text-sm md:text-base">
                  {item.displayPrice}
                </span>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg touch-manipulation ml-2 sm:ml-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SelectedMenu;

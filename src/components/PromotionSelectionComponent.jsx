import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

const PromotionSelectionComponent = ({ promotions, selectedPromoId, onSelect }) => {
  // @review: Grouping by seller as per business rule #6
  const groupedPromotions = (promotions || []).reduce((acc, promo) => {
    const group = promo.createdBy === 'ADMIN' ? 'Site-wide (Auto-Applied)' : `Seller: ${promo.sellerId || 'Other'}`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(promo);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Available Promotions
      </h3>
      
      {Object.entries(groupedPromotions).map(([group, promos]) => (
        <div key={group} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{group}</h4>
          <div className="grid grid-cols-1 gap-3">
            {promos.map((promo) => {
              const isSelected = selectedPromoId === promo.id;
              const isExpired = promo.isExpired;
              const isUsed = promo.isUsed && promo.usageType === 'ONE_TIME';
              const isDisabled = isExpired || isUsed || promo.createdBy === 'ADMIN';

              return (
                <div
                  key={promo.id}
                  onClick={() => !isDisabled && onSelect(promo.id)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}
                    ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed bg-gray-50 border-gray-200' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{promo.name}</span>
                        {promo.createdBy === 'ADMIN' && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            ADMIN OVERRIDE
                          </span>
                        )}
                        {isExpired && (
                          <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {promo.discountType === 'PERCENTAGE' ? `${promo.value}% OFF` : `$${promo.value} Flat Discount`}
                      </p>
                      {promo.usageType === 'ONE_TIME' && (
                        <p className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          One-time use only
                        </p>
                      )}
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-green-600" />}
                  </div>
                  
                  {/* Strikethrough preview logic would go here in the parent */}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromotionSelectionComponent;

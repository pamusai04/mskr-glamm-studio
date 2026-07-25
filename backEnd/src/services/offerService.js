const Offer = require("../models/Offer");
const { ServiceItem } = require("../models/Service");
const BookingHistory = require("../models/BookingHistory");
const BookService = require("../models/bookService");

class OfferService {
  
  static async isFirstTimeUser(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const bookings = await BookingHistory.find({ userId }).limit(1);
      return bookings.length === 0;
    } catch (error) {
      throw new Error(`Failed to check first time user: ${error.message}`);
    }
  }

  static async hasUserUsedOffer(userId, offerId) {
    try {
      if (!userId || !offerId) {
        throw new Error("User ID and Offer ID are required");
      }
      
      return await BookService.hasUserUsedOffer(userId, offerId);
    } catch (error) {
      throw new Error(`Failed to check offer usage: ${error.message}`);
    }
  }

  static async getApplicableOffers(serviceId, userId, totalAmount = 0) {
    try {
      if (!serviceId) {
        throw new Error("Service ID is required");
      }
      
      const currentDate = new Date();
      
      const query = {
        isActive: true,
        validFrom: { $lte: currentDate },
        validUntil: { $gte: currentDate },
        applicableService: serviceId
      };

      let offers = await Offer.find(query).populate('applicableService');
      
      offers = offers.filter(offer => {
        if (offer.minAmount && offer.minAmount > 0) {
          return totalAmount >= offer.minAmount;
        }
        return true;
      });
      
      if (userId) {
        const isFirstTime = await this.isFirstTimeUser(userId);
        
        const filteredOffers = [];
        for (const offer of offers) {
          if (offer.firstTimeUserOnly && !isFirstTime) {
            continue;
          }
          
          const hasUsed = await this.hasUserUsedOffer(userId, offer._id);
          if (hasUsed) {
            continue;
          }
          
          filteredOffers.push(offer);
        }
        
        offers = filteredOffers;
      } else {
        offers = offers.filter(offer => !offer.firstTimeUserOnly);
      }
      
      offers = offers.filter(offer => 
        !offer.maxUses || offer.currentUses < offer.maxUses
      );
      
      return offers;
    } catch (error) {
      throw new Error(`Failed to get applicable offers: ${error.message}`);
    }
  }

  static calculateDiscountedPrice(pricePerPerson, offer) {
    try {
      if (!offer) {
        return {
          discountedPricePerPerson: pricePerPerson,
          discountPerPerson: 0,
          originalPricePerPerson: pricePerPerson,
          hasDiscount: false
        };
      }
      
      if (!pricePerPerson || pricePerPerson <= 0) {
        throw new Error("Invalid price per person");
      }
      
      let discountedPricePerPerson = pricePerPerson;
      let discountPerPerson = 0;

      switch (offer.offerType) {
        case 'percentage':
          if (offer.discountValue > 100) {
            throw new Error("Percentage discount cannot exceed 100%");
          }
          discountPerPerson = (pricePerPerson * offer.discountValue) / 100;
          discountedPricePerPerson = pricePerPerson - discountPerPerson;
          break;
        case 'fixed':
          discountPerPerson = offer.discountValue;
          discountedPricePerPerson = Math.max(0, pricePerPerson - discountPerPerson);
          break;
        default:
          throw new Error(`Invalid offer type: ${offer.offerType}`);
      }

      return {
        discountedPricePerPerson: Math.floor(discountedPricePerPerson),
        discountPerPerson: Math.floor(discountPerPerson),
        originalPricePerPerson: pricePerPerson,
        hasDiscount: discountPerPerson > 0,
        offerType: offer.offerType,
        discountValue: offer.discountValue,
        offerId: offer._id
      };
    } catch (error) {
      throw new Error(`Failed to calculate discounted price: ${error.message}`);
    }
  }

  static async getCartApplicableOffers(cartItems, userId) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return {
          cartTotal: 0,
          offers: []
        };
      }
      
      const cartOffers = [];
      let totalCartAmount = 0;
      const serviceDetails = {};
      
      for (const item of cartItems) {
        const serviceId = item.service_id && item.service_id._id ? item.service_id._id : item.service_id;
        const service = await ServiceItem.findById(serviceId);
        if (service) {
          const itemTotal = service.price * item.numberOfPersons;
          serviceDetails[serviceId.toString()] = {
            service,
            itemTotal,
            numberOfPersons: item.numberOfPersons,
            pricePerPerson: service.price
          };
          totalCartAmount += itemTotal;
        }
      }
      
      for (const [serviceId, detail] of Object.entries(serviceDetails)) {
        const offers = await this.getApplicableOffers(serviceId, userId, totalCartAmount);
        const bestOffer = offers.length > 0 ? offers[0] : null;
        
        if (bestOffer) {
          const discounted = this.calculateDiscountedPrice(detail.pricePerPerson, bestOffer);
          const discountOnOnePerson = discounted.discountPerPerson;
          const totalDiscount = discountOnOnePerson;
          const finalTotal = detail.itemTotal - totalDiscount;
          
          cartOffers.push({
            serviceId: serviceId,
            serviceName: detail.service.name,
            pricePerPerson: detail.pricePerPerson,
            numberOfPersons: detail.numberOfPersons,
            originalTotal: detail.itemTotal,
            offer: {
              offerId: bestOffer._id,
              title: bestOffer.title,
              serviceName: detail.service.name,
              description: bestOffer.description,
              offerType: bestOffer.offerType,
              discountValue: bestOffer.discountValue,
              discountOnOnePerson: discountOnOnePerson,
              totalDiscount: totalDiscount,
              finalTotal: finalTotal
            }
          });
        } else {
          cartOffers.push({
            serviceId: serviceId,
            serviceName: detail.service.name,
            pricePerPerson: detail.pricePerPerson,
            numberOfPersons: detail.numberOfPersons,
            originalTotal: detail.itemTotal,
            offer: null
          });
        }
      }
      
      return {
        cartTotal: totalCartAmount,
        offers: cartOffers
      };
    } catch (error) {
      throw new Error(`Failed to get cart applicable offers: ${error.message}`);
    }
  }

  static async validateOffer(offerId, userId, cartItems) {
    try {
      if (!offerId) {
        return {
          success: false,
          message: "Offer ID is required"
        };
      }
      
      if (!userId) {
        return {
          success: false,
          message: "User ID is required"
        };
      }
      
      const offer = await Offer.findById(offerId);
      if (!offer) {
        return {
          success: false,
          message: "Offer not found"
        };
      }
      
      const currentDate = new Date();
      
      if (!offer.isActive) {
        return {
          success: false,
          message: "Offer is not active"
        };
      }
      
      if (offer.validFrom > currentDate) {
        return {
          success: false,
          message: "Offer not started yet"
        };
      }
      
      if (offer.validUntil < currentDate) {
        return {
          success: false,
          message: "Offer has expired"
        };
      }
      
      if (offer.maxUses && offer.currentUses >= offer.maxUses) {
        return {
          success: false,
          message: "Offer usage limit reached"
        };
      }
      
      const hasUsed = await this.hasUserUsedOffer(userId, offer._id);
      if (hasUsed) {
        return {
          success: false,
          message: "You already used this offer"
        };
      }
      
      if (offer.firstTimeUserOnly) {
        const isFirstTime = await this.isFirstTimeUser(userId);
        if (!isFirstTime) {
          return {
            success: false,
            message: "Only for first time users"
          };
        }
      }
      
      if (cartItems && cartItems.length > 0) {
        let isApplicable = false;
        let applicableServiceData = null;
        let totalCartAmount = 0;
        
        for (const item of cartItems) {
          const serviceId = item.service_id && item.service_id._id ? item.service_id._id : item.service_id;
          const service = await ServiceItem.findById(serviceId);
          if (service) {
            const itemTotal = service.price * item.numberOfPersons;
            totalCartAmount += itemTotal;
            
            const offerServiceId = offer.applicableService._id || offer.applicableService;
            
            if (offerServiceId.toString() === serviceId.toString()) {
              isApplicable = true;
              applicableServiceData = {
                service,
                numberOfPersons: item.numberOfPersons,
                pricePerPerson: service.price,
                itemTotal: itemTotal
              };
            }
          }
        }
        
        if (!isApplicable) {
          return {
            success: false,
            message: "Offer not applicable to cart items"
          };
        }
        
        if (offer.minAmount && offer.minAmount > 0 && totalCartAmount < offer.minAmount) {
          return {
            success: false,
            message: `Minimum order ₹${offer.minAmount} required`
          };
        }
        
        return {
          success: true,
          message: "Offer is valid",
          data: {
            offer,
            applicableServiceData,
            totalCartAmount
          }
        };
      }
      
      return {
        success: true,
        message: "Offer is valid",
        data: { offer }
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error.message}`
      };
    }
  }

  static async applyOfferToCart(cartItems, userId, selectedOfferId) {
    try {
      if (!selectedOfferId) {
        return {
          success: false,
          message: "Offer ID is required"
        };
      }
      
      if (!userId) {
        return {
          success: false,
          message: "User ID is required"
        };
      }
      
      if (!cartItems || cartItems.length === 0) {
        return {
          success: false,
          message: "Cart is empty"
        };
      }
      
      const validation = await this.validateOffer(selectedOfferId, userId, cartItems);
      if (!validation.success) {
        return validation;
      }
      
      const { offer, applicableServiceData, totalCartAmount } = validation.data;
      
      const discounted = this.calculateDiscountedPrice(
        applicableServiceData.pricePerPerson, 
        offer
      );
      
      const discountAmount = discounted.discountPerPerson * applicableServiceData.numberOfPersons;
      const finalTotal = totalCartAmount - discountAmount;
      
      return {
        success: true,
        message: "Offer applied successfully",
        data: {
          offerApplied: {
            offerId: offer._id,
            title: offer.title,
            description: offer.description,
            offerType: offer.offerType,
            discountValue: offer.discountValue,
            discountAmount: Math.floor(discountAmount),
            calculation: {
              pricePerPerson: applicableServiceData.pricePerPerson,
              numberOfPersons: applicableServiceData.numberOfPersons,
              originalServiceTotal: applicableServiceData.itemTotal,
              discountApplied: Math.floor(discountAmount),
              finalServiceTotal: Math.floor(applicableServiceData.itemTotal - discountAmount)
            }
          },
          summary: {
            originalTotal: totalCartAmount,
            discountAmount: Math.floor(discountAmount),
            finalTotal: Math.floor(finalTotal)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to apply offer: ${error.message}`
      };
    }
  }

}

module.exports = OfferService;


// const Offer = require("../models/Offer");
// const { ServiceItem } = require("../models/Service");
// const BookingHistory = require("../models/bookingHistory");
// const BookService = require("../models/bookService");

// class OfferService {
  
//   static async isFirstTimeUser(userId) {
//     try {
//       if (!userId) {
//         throw new Error("User ID is required");
//       }
      
//       const bookings = await BookingHistory.find({ userId }).limit(1);
//       return bookings.length === 0;
//     } catch (error) {
//       throw new Error(`Failed to check first time user: ${error.message}`);
//     }
//   }

//   static async hasUserUsedOffer(userId, offerId) {
//     try {
//       if (!userId || !offerId) {
//         throw new Error("User ID and Offer ID are required");
//       }
      
//       return await BookService.hasUserUsedOffer(userId, offerId);
//     } catch (error) {
//       throw new Error(`Failed to check offer usage: ${error.message}`);
//     }
//   }

//   static async getApplicableOffers(serviceId, userId, totalAmount = 0) {
//     try {
//       if (!serviceId) {
//         throw new Error("Service ID is required");
//       }
      
//       const currentDate = new Date();
      
//       const query = {
//         isActive: true,
//         validFrom: { $lte: currentDate },
//         validUntil: { $gte: currentDate },
//         applicableService: serviceId
//       };

//       let offers = await Offer.find(query).populate('applicableService');
      
//       offers = offers.filter(offer => {
//         if (offer.minAmount && offer.minAmount > 0) {
//           return totalAmount >= offer.minAmount;
//         }
//         return true;
//       });
      
//       if (userId) {
//         const isFirstTime = await this.isFirstTimeUser(userId);
        
//         const filteredOffers = [];
//         for (const offer of offers) {
//           if (offer.firstTimeUserOnly && !isFirstTime) {
//             continue;
//           }
          
//           const hasUsed = await this.hasUserUsedOffer(userId, offer._id);
//           if (hasUsed) {
//             continue;
//           }
          
//           filteredOffers.push(offer);
//         }
        
//         offers = filteredOffers;
//       } else {
//         offers = offers.filter(offer => !offer.firstTimeUserOnly);
//       }
      
//       offers = offers.filter(offer => 
//         !offer.maxUses || offer.currentUses < offer.maxUses
//       );
      
//       return offers;
//     } catch (error) {
//       throw new Error(`Failed to get applicable offers: ${error.message}`);
//     }
//   }

//   static calculateDiscountedPrice(pricePerPerson, offer) {
//     try {
//       if (!offer) {
//         return {
//           discountedPricePerPerson: pricePerPerson,
//           discountPerPerson: 0,
//           originalPricePerPerson: pricePerPerson,
//           hasDiscount: false
//         };
//       }
      
//       if (!pricePerPerson || pricePerPerson <= 0) {
//         throw new Error("Invalid price per person");
//       }
      
//       let discountedPricePerPerson = pricePerPerson;
//       let discountPerPerson = 0;

//       switch (offer.offerType) {
//         case 'percentage':
//           if (offer.discountValue > 100) {
//             throw new Error("Percentage discount cannot exceed 100%");
//           }
//           discountPerPerson = (pricePerPerson * offer.discountValue) / 100;
//           discountedPricePerPerson = pricePerPerson - discountPerPerson;
//           break;
//         case 'fixed':
//           discountPerPerson = offer.discountValue;
//           discountedPricePerPerson = Math.max(0, pricePerPerson - discountPerPerson);
//           break;
//         default:
//           throw new Error(`Invalid offer type: ${offer.offerType}`);
//       }

//       return {
//         discountedPricePerPerson: Math.round(discountedPricePerPerson * 100) / 100,
//         discountPerPerson: Math.round(discountPerPerson * 100) / 100,
//         originalPricePerPerson: pricePerPerson,
//         hasDiscount: discountPerPerson > 0,
//         offerType: offer.offerType,
//         discountValue: offer.discountValue,
//         offerId: offer._id
//       };
//     } catch (error) {
//       throw new Error(`Failed to calculate discounted price: ${error.message}`);
//     }
//   }

//   static async getCartApplicableOffers(cartItems, userId) {
//     try {
//       if (!cartItems || cartItems.length === 0) {
//         return {
//           cartTotal: 0,
//           offers: []
//         };
//       }
      
//       const cartOffers = [];
//       let totalCartAmount = 0;
//       const serviceDetails = {};
      
//       for (const item of cartItems) {
//         const serviceId = item.service_id && item.service_id._id ? item.service_id._id : item.service_id;
//         const service = await ServiceItem.findById(serviceId);
//         if (service) {
//           const itemTotal = service.price * item.numberOfPersons;
//           serviceDetails[serviceId.toString()] = {
//             service,
//             itemTotal,
//             numberOfPersons: item.numberOfPersons,
//             pricePerPerson: service.price
//           };
//           totalCartAmount += itemTotal;
//         }
//       }
      
//       for (const [serviceId, detail] of Object.entries(serviceDetails)) {
//         const offers = await this.getApplicableOffers(serviceId, userId, totalCartAmount);
//         const bestOffer = offers.length > 0 ? offers[0] : null;
        
//         if (bestOffer) {
//           const discounted = this.calculateDiscountedPrice(detail.pricePerPerson, bestOffer);
//           const discountOnOnePerson = discounted.discountPerPerson;
//           const totalDiscount = discountOnOnePerson;
//           const finalTotal = detail.itemTotal - totalDiscount;
          
//           cartOffers.push({
//             serviceId: serviceId,
//             serviceName: detail.service.name,
//             pricePerPerson: detail.pricePerPerson,
//             numberOfPersons: detail.numberOfPersons,
//             originalTotal: detail.itemTotal,
//             offer: {
//               offerId: bestOffer._id,
//               title: bestOffer.title,
//               serviceName  : detail.service.name,
//               description: bestOffer.description,
//               offerType: bestOffer.offerType,
//               discountValue: bestOffer.discountValue,
//               discountOnOnePerson: discountOnOnePerson,
//               totalDiscount: totalDiscount,
//               finalTotal: finalTotal
//             }
//           });
//         } else {
//           cartOffers.push({
//             serviceId: serviceId,
//             serviceName: detail.service.name,
//             pricePerPerson: detail.pricePerPerson,
//             numberOfPersons: detail.numberOfPersons,
//             originalTotal: detail.itemTotal,
//             offer: null
//           });
//         }
//       }
      
//       return {
//         cartTotal: totalCartAmount,
//         offers: cartOffers
//       };
//     } catch (error) {
//       throw new Error(`Failed to get cart applicable offers: ${error.message}`);
//     }
//   }

//   static async validateOffer(offerId, userId, cartItems) {
//     try {
//       if (!offerId) {
//         return {
//           success: false,
//           message: "Offer ID is required"
//         };
//       }
      
//       if (!userId) {
//         return {
//           success: false,
//           message: "User ID is required"
//         };
//       }
      
//       const offer = await Offer.findById(offerId);
//       if (!offer) {
//         return {
//           success: false,
//           message: "Offer not found"
//         };
//       }
      
//       const currentDate = new Date();
      
//       if (!offer.isActive) {
//         return {
//           success: false,
//           message: "Offer is not active"
//         };
//       }
      
//       if (offer.validFrom > currentDate) {
//         return {
//           success: false,
//           message: "Offer not started yet"
//         };
//       }
      
//       if (offer.validUntil < currentDate) {
//         return {
//           success: false,
//           message: "Offer has expired"
//         };
//       }
      
//       if (offer.maxUses && offer.currentUses >= offer.maxUses) {
//         return {
//           success: false,
//           message: "Offer usage limit reached"
//         };
//       }
      
//       const hasUsed = await this.hasUserUsedOffer(userId, offer._id);
//       if (hasUsed) {
//         return {
//           success: false,
//           message: "You already used this offer"
//         };
//       }
      
//       if (offer.firstTimeUserOnly) {
//         const isFirstTime = await this.isFirstTimeUser(userId);
//         if (!isFirstTime) {
//           return {
//             success: false,
//             message: "Only for first time users"
//           };
//         }
//       }
      
//       if (cartItems && cartItems.length > 0) {
//         let isApplicable = false;
//         let applicableServiceData = null;
//         let totalCartAmount = 0;
        
//         for (const item of cartItems) {
//           const serviceId = item.service_id && item.service_id._id ? item.service_id._id : item.service_id;
//           const service = await ServiceItem.findById(serviceId);
//           if (service) {
//             const itemTotal = service.price * item.numberOfPersons;
//             totalCartAmount += itemTotal;
            
//             const offerServiceId = offer.applicableService._id || offer.applicableService;
            
//             if (offerServiceId.toString() === serviceId.toString()) {
//               isApplicable = true;
//               applicableServiceData = {
//                 service,
//                 numberOfPersons: item.numberOfPersons,
//                 pricePerPerson: service.price,
//                 itemTotal: itemTotal
//               };
//             }
//           }
//         }
        
//         if (!isApplicable) {
//           return {
//             success: false,
//             message: "Offer not applicable to cart items"
//           };
//         }
        
//         if (offer.minAmount && offer.minAmount > 0 && totalCartAmount < offer.minAmount) {
//           return {
//             success: false,
//             message: `Minimum order ₹${offer.minAmount} required`
//           };
//         }
        
//         return {
//           success: true,
//           message: "Offer is valid",
//           data: {
//             offer,
//             applicableServiceData,
//             totalCartAmount
//           }
//         };
//       }
      
//       return {
//         success: true,
//         message: "Offer is valid",
//         data: { offer }
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: `Validation failed: ${error.message}`
//       };
//     }
//   }

//   static async applyOfferToCart(cartItems, userId, selectedOfferId) {
//     try {
//       if (!selectedOfferId) {
//         return {
//           success: false,
//           message: "Offer ID is required"
//         };
//       }
      
//       if (!userId) {
//         return {
//           success: false,
//           message: "User ID is required"
//         };
//       }
      
//       if (!cartItems || cartItems.length === 0) {
//         return {
//           success: false,
//           message: "Cart is empty"
//         };
//       }
      
//       const validation = await this.validateOffer(selectedOfferId, userId, cartItems);
//       if (!validation.success) {
//         return validation;
//       }
      
//       const { offer, applicableServiceData, totalCartAmount } = validation.data;
      
//       const discounted = this.calculateDiscountedPrice(
//         applicableServiceData.pricePerPerson, 
//         offer
//       );
      
//       const discountAmount = discounted.discountPerPerson * applicableServiceData.numberOfPersons;
//       const finalTotal = totalCartAmount - discountAmount;
      
//       return {
//         success: true,
//         message: "Offer applied successfully",
//         data: {
//           offerApplied: {
//             offerId: offer._id,
//             title: offer.title,
//             description: offer.description,
//             offerType: offer.offerType,
//             discountValue: offer.discountValue,
//             discountAmount: discountAmount,
//             calculation: {
//               pricePerPerson: applicableServiceData.pricePerPerson,
//               numberOfPersons: applicableServiceData.numberOfPersons,
//               originalServiceTotal: applicableServiceData.itemTotal,
//               discountApplied: discountAmount,
//               finalServiceTotal: applicableServiceData.itemTotal - discountAmount
//             }
//           },
//           summary: {
//             originalTotal: totalCartAmount,
//             discountAmount: discountAmount,
//             finalTotal: finalTotal
//           }
//         }
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: `Failed to apply offer: ${error.message}`
//       };
//     }
//   }

// }

// module.exports = OfferService;



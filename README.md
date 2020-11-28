# interview
The system you are implementing has two main roles: \
     &nbsp; 1. Provide the client to update/add/get documents data. in order to do that you need to \
         &nbsp;&nbsp;1.1. Implement MemoryStorage \
         &nbsp;&nbsp;1.2. Build ASP.NET service which provides this. Notice that you can have about 1K calls in a second + the MemoryStorage sometimes crushes on saving the docs \
         &nbsp;&nbsp;1.3. Make changes so it wil be very easily to replace MemoryStorage with other kind of storage which implements the same methods(no need to write different storage implementation) \
         &nbsp;&nbsp;1.4. write unit tests + mocks to MemoryStorage \
     &nbsp;2. Implement StartMakingDiscounts in DocumentsDiscountService. This service responsible for making discounts to all documents every x seconds. \
     &nbsp;3. When your service starts, call the StartMakingDiscounts so it will continue making dicounts as long as your whole service lives \
     &nbsp;4. Copy the method StartMakingDiscounts at the same class and call it StartMakingOneDiscount. The responsibilty of the method will be to make \
        discounts only to documents which were updated in our storage two times. You can make changes in your data contracts and your MemoryStorage for this implementation. \
     &nbsp;4. Good Luck!!!

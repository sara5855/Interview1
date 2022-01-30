using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace DocumentsEngine
{
    public class DocumentsDiscountService
    { 
        public async void StartMakingDiscounts()
        {
            var storage = new MemoryStorage();

            while (true)
            {
                var docIds = storage.GetAllDocumentsIds().Result;
                foreach (var id in docIds)
                {
                    Document doc = await storage.GetDocument(id);
                    if (doc.TotalAmount - 11 >= 0) {
                        storage.DocumentAmountDiscount(id, 11);
                    // ToDo: make document discount with amount of 11 only if the amount after the update will be valid
                    }
                }
                Thread.Sleep(3000);
            }
        }
    }
}

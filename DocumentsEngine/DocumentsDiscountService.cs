using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace DocumentsEngine
{
    public class DocumentsDiscountService
    { 
        public void StartMakingDiscounts()
        {
            var storage = new MemoryStorage();

            while (true)
            {
                var docIds = storage.GetAllDocumentsIds();
                foreach (var id in docIds)
                {
                    // ToDo: make document discount with amount of 11 only if the amount after the update will be valid

                }
                Thread.Sleep(3000);
            }
        }
    }
}

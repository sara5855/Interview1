using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace DocumentsEngine
{
    public class MemoryStorage
    {
        public void SaveDocument(Document document)
        {
            Random rnd = new Random();
            if (rnd.Next(1, 11) > 5)
            {
                Thread.Sleep(1000);
                // ToDo: Store in memory here
            }
            throw new Exception("Failed to generate document");
        }

        public Document GetDocument(int id)
        {
            // ToDo: Fetch from memory here
            return null;
        }

        public Document GetAllDocuments()
        {
            // ToDo: Implement
            return null;
        }

        public List<int> GetAllDocumentsIds()
        {
            // ToDo: Implement
            return null;
        }

        public void UpdateDocumentAmount(int docId, decimal newAmount)
        {
            // ToDo: Implement
        }

        /// <summary>
        /// Reduce the discountAmount from the current amount
        /// </summary>
        /// <param name="docId"></param>
        /// <param name="discountAmount"></param>
        public void DocumentAmountDiscount(int docId, decimal discountAmount)
        {
            // ToDo: Implement
        }
    }
}

using System;
using System.Collections.Generic;
using System.Composition;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Polly;

namespace DocumentsEngine
{
    [Export(typeof(IStorage))]
    public class MemoryStorage : IStorage
    {
        Dictionary<int, Document> Documents = new Dictionary<int, Document>();
        int Id = 0;
        public void SaveDocument(Document document)
        {
            Policy
               .Handle<DocumentWasNotSavedException>()
               .Retry(5)
               .Execute(() => SaveDocumentAction(document));
        }

        private void SaveDocumentAction(Document document)
        {
            Random rnd = new Random();
            if (rnd.Next(1, 11) > 5)
            {
                Task.Delay(1000);
                // ToDo: Store in memory here
                document.Id = Id;
                Documents.Add(Id, document);
                Id++;
                
            }
            else
            {
                throw new DocumentWasNotSavedException("Failed to generate document");
            }
        }

        public Document GetDocument(int id)
        {
            // ToDo: Fetch from memory here
            bool res = Documents.TryGetValue(id, out Document document);
            if (res)
            {
                return document;
            }
            else
            {
                throw new DocumentWasNotFoundException("The document id was not found");
            }
        }

        public IDictionary<int, Document> GetAllDocuments()
        {
            // ToDo: Implement
            return Documents;
        }

        public List<int> GetAllDocumentsIds()
        {
            List<int> ids = new List<int>();
            Dictionary<int, Document>.KeyCollection keys = Documents.Keys;
            // ToDo: Implement
            foreach(var key in keys)
            {
                ids.Add(key);
            }
            return ids;
        }

        public void UpdateDocumentAmount(int docId, decimal newAmount)
        {
            // ToDo: Implement
            bool res = Documents.TryGetValue(docId, out Document document);
            if (res)
            {
                document.TotalAmount = newAmount;
            }
            else
            {
                throw new DocumentWasNotFoundException("Failed to update document amount, The document id was not found");
            }
        }

        public void DeleteDocument(int docId)
        {
            bool res = Documents.TryGetValue(docId, out Document document);
            if (res)
            {
                Documents.Remove(docId);
            }
            else
            {
                throw new DocumentWasNotFoundException("Failed to delete document, The document id was not found");
            }
        }

        /// <summary>
        /// Reduce the discountAmount from the current amount
        /// </summary>
        /// <param name="docId"></param>
        /// <param name="discountAmount"></param>
        public void DocumentAmountDiscount(int docId, decimal discountAmount)
        {
            // ToDo: Implement
            bool res = Documents.TryGetValue(docId, out Document document);
            if (res)
            {
                document.TotalAmount -= discountAmount;

            }
            else
            {
                throw new DocumentWasNotFoundException("Failed to reduce discount from current amout, The document id was not found");
            }
        }
    }
}

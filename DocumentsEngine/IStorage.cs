using System.Collections.Generic;
using System.Threading.Tasks;

namespace DocumentsEngine
{
    public interface IStorage
    {
        void SaveDocument(Document document);
        Task<Document> GetDocument(int id);
        Task<IDictionary<int, Document>> GetAllDocuments();
        Task<List<int>> GetAllDocumentsIds();
        void UpdateDocumentAmount(int docId, decimal newAmount);
        void DeleteDocument(int docId);
        void DocumentAmountDiscount(int docId, decimal discountAmount);
    }
}
using System.Collections.Generic;

namespace DocumentsEngine
{
    public interface IStorage
    {
        void SaveDocument(Document document);
        Document GetDocument(int id);
        IDictionary<int, Document> GetAllDocuments();
        List<int> GetAllDocumentsIds();
        void UpdateDocumentAmount(int docId, decimal newAmount);
        void DeleteDocument(int docId);
        void DocumentAmountDiscount(int docId, decimal discountAmount);
    }
}
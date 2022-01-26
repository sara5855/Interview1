using System;
using System.Collections.Generic;
using System.Composition;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Mvc;

namespace DocumentsEngine
{
    public class DocumentsController : ApiController
    {
        IStorage storage;
        [ImportingConstructor]
        public DocumentsController()
        {
            storage = new MemoryStorage();
        }

        // GET: api/documents/5
        public Document Get(int id)
        {
            return storage.GetDocument(id);
        }

        // POST: api/documents
        public void Post([FromBody]Document value)
        {
            storage.SaveDocument(value);
        }
        // GET: api/documents
        public IDictionary<int, Document> Get()
        {
            return storage.GetAllDocuments();
        }
        // DELETE: api/documents/5
        public void Delete(int id)
        {
            storage.DeleteDocument(id);
        }
        // PUT: api/documents/5
        public void Put(int docId, [FromBody]decimal newAmount)
        {
            storage.UpdateDocumentAmount(docId, newAmount);
        }

    }
}
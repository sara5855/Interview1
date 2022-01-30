using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DocumentsEngine;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace UnitTestProject1
{
    [TestClass]
    public class UnitTest1
    {
        MemoryStorage m = new MemoryStorage();
        [TestMethod]
        public void AddDocumentTest()
        {
            Document d = new Document("doc1", 100);
            try
            {
                m.SaveDocument(d);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
        [TestMethod]
        public void GetDocumentTest()
        {

            try
            {
                Task<Document> t = m.GetDocument(1);
                Document d = t.Result;
                Console.WriteLine("Title: " + d.Title);
                Console.WriteLine("TotalAmount: " + d.TotalAmount);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
        [TestMethod]
        public void GetAllDocumentsTest()
        {
            try
            {
                IDictionary<int, Document> docs = m.GetAllDocuments().Result;
                foreach (var doc in docs)
                {
                    Console.WriteLine("Title: " + doc.Value.Title);
                    Console.WriteLine("TotalAmount: " + doc.Value.TotalAmount);
                }

            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
        [TestMethod]
        public void GetAllDocumentsIdsTest()
        {
            try
            {
                List<int> ids = m.GetAllDocumentsIds().Result;
                foreach (var id in ids)
                {
                    Console.WriteLine("ID: " + id);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
        [TestMethod]
        public void DeleteDocumentTest()
        {
            try
            {
                m.DeleteDocument(1);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
        [TestMethod]
        public void UpdateDocumentAmountTest()
        {
            try
            {
                m.UpdateDocumentAmount(1, 300);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
        [TestMethod]
        public void DocumentAmountDiscountTest()
        {
            try
            {
                m.DocumentAmountDiscount(1, 50);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
    }
}

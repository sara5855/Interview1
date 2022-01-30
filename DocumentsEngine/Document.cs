using System;
using System.Collections.Generic;
using System.Text;

namespace DocumentsEngine
{
    public class Document
    {
        public Document() { }
        public Document(string title, decimal totalAmount)
        {
            Title = title;
            TotalAmount = totalAmount; 
        }
        public int Id { get; set; }

        public string Title { get; set; }

        public decimal TotalAmount { get; set; }
    }
}

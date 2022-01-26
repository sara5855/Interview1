using System;
using System.Collections.Generic;
using System.Text;

namespace DocumentsEngine
{

    public class DocumentWasNotFoundException : Exception
    {
        public DocumentWasNotFoundException()
        {
        }

        public DocumentWasNotFoundException(string message)
            : base(message)
        {
        }

        public DocumentWasNotFoundException(string message, Exception inner)
            : base(message, inner)
        {
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace DocumentsEngine
{

    public class DocumentWasNotSavedException : Exception
    {
        public DocumentWasNotSavedException()
        {
        }

        public DocumentWasNotSavedException(string message)
            : base(message)
        {
        }

        public DocumentWasNotSavedException(string message, Exception inner)
            : base(message, inner)
        {
        }
    }
}

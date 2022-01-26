﻿using System;
using System.ComponentModel;
using Microsoft.Extensions.Hosting;

namespace DocumentsEngine
{
    class Program
    {

        /// <summary>
        /// The system you are implementing has two main roles:
        ///     1. Provide the client to update/add/get documents data. in order to do that you need to
        ///         1.1. Implement MemoryStorage
        ///         1.2. Build ASP.NET service which provides this. Notice that you can have about 1K calls in a second + the MemoryStorage sometimes crushes on saving the docs
        ///         1.3. Make changes so it wil be very easily to replace MemoryStorage with other kind of storage which implements the same methods(no need to write different storage implementation)
        ///         1.4. write unit tests + mocks to MemoryStorage
        ///     2. Implement StartMakingDiscounts in DocumentsDiscountService. This service responsible for making discounts to all documents every x seconds.
        ///     3. When your service starts, call the StartMakingDiscounts so it will continue making dicounts as long as your whole service lives
        ///     4. Copy the method StartMakingDiscounts at the same class and call it StartMakingOneDiscount. The responsibilty of the method will be to make
        ///        discounts only to documents which were updated in our storage two times. You can make changes in your data contracts and your MemoryStorage for this implementation.
        ///     4. Good Luck!!!
        /// </summary>
        private static Container container;

        public static object Lifestyle { get; private set; }

        /// <param name="args"></param>
        static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

            Console.WriteLine("Hello World!");
            Console.ReadLine();
            // TO do : Use Dependency Injection
            //IStorage storage = new MemoryStorage();
            //try
            //{
            //    //storage.SaveDocument(new Document { Title = "my doc1", TotalAmount = 100 });
            //}
            //catch(Exception ex)
            //{

            //}
        }

        }
    }

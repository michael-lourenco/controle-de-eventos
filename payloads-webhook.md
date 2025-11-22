## PAYLOADS WEBHOOK HOTMART


Compra expirada 
```
{
  "id": "1d85822f-fa41-4c58-8c09-0ac945198972",
  "creation_date": 1763247746098,
  "event": "PURCHASE_EXPIRED",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247746091
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "EXPIRED",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Primeiro acesso
```
{
  "id": "7fe795fa-285c-430f-9a91-afce10a9216f",
  "creationDate": 1763247745996,
  "event": "CLUB_FIRST_ACCESS",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "name": "Produto test postback2"
    },
    "user": {
      "name": "Test Name",
      "email": "teste@hotmart.com.br"
    }
  }
}
```

Compra cancelada
```
{
  "id": "ea409c21-53f7-4478-a870-89a03d6df8d5",
  "creation_date": 1763247746014,
  "event": "PURCHASE_CANCELED",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247746008
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "CANCELED",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Chargeback
```
{
  "id": "8b2839d3-8d3c-4dee-ad79-a487d7814d6d",
  "creation_date": 1763247745854,
  "event": "PURCHASE_CHARGEBACK",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247745848
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "CHARGEBACK",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Módulo completo
```
{
  "id": "082eb61b-20b4-4627-9f84-de030e548080",
  "creation_date": 1763247745900,
  "event": "CLUB_MODULE_COMPLETED",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": "00000",
      "name": "Produto test postback2"
    },
    "user": {
      "email": "teste@hotmart.com.br",
      "name": "Test Name"
    },
    "module": {
      "id": "hash123",
      "name": "Mudule test name"
    }
  }
}
```

Pedido de reembolso 
```
{
  "id": "6e401e42-f0d8-4416-a082-e95b3e35c2e3",
  "creation_date": 1763247746136,
  "event": "PURCHASE_PROTEST",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247746130
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "DISPUTE",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Compra aprovada
```
{
  "id": "545e7d21-8fc4-4906-8fba-dcd7889f6481",
  "creation_date": 1763247745737,
  "event": "PURCHASE_APPROVED",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247745730
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "APPROVED",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Compra atrasada
```
{
  "id": "21f767f2-fa94-4bf7-b68a-002979678a8a",
  "creation_date": 1763247745919,
  "event": "PURCHASE_DELAYED",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247745910
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "DELAYED",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Compra reembolsada
```
{
  "id": "0efd923f-c6ef-405e-bbd5-df409a5b36e5",
  "creation_date": 1763247746059,
  "event": "PURCHASE_REFUNDED",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247746052
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "REFUNDED",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Aguardando pagamento 
```
{
  "id": "3c290891-8c78-410e-b6cb-5edd7ca9a88e",
  "creation_date": 1763247745671,
  "event": "PURCHASE_BILLET_PRINTED",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247745660
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "BILLET_PRINTED",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Compra completa 
```
{
  "id": "a11df2c9-4b6c-4836-a1c0-60ea3d4b49da",
  "creation_date": 1763247745782,
  "event": "PURCHASE_COMPLETE",
  "version": "2.0.0",
  "data": {
    "product": {
      "id": 0,
      "ucode": "fb056612-bcc6-4217-9e6d-2a5d1110ac2f",
      "name": "Produto test postback2",
      "warranty_date": "2017-12-27T00:00:00Z",
      "support_email": "support@hotmart.com.br",
      "has_co_production": false,
      "is_physical_product": false,
      "content": {
        "has_physical_products": true,
        "products": [
          {
            "id": 4774438,
            "ucode": "559fef42-3406-4d82-b775-d09bd33936b1",
            "name": "How to Make Clear Ice",
            "is_physical_product": false
          },
          {
            "id": 4999597,
            "ucode": "099e7644-b7d1-43d6-82a9-ec6be0118a4b",
            "name": "Organizador de Poeira",
            "is_physical_product": true
          }
        ]
      }
    },
    "affiliates": [
      {
        "affiliate_code": "Q58388177J",
        "name": "Affiliate name"
      }
    ],
    "buyer": {
      "email": "testeComprador271101postman15@example.com",
      "name": "Teste Comprador",
      "first_name": "Teste",
      "last_name": "Comprador",
      "checkout_phone_code": "999999999",
      "checkout_phone": "99999999900",
      "address": {
        "city": "Uberlândia",
        "country": "Brasil",
        "country_iso": "BR",
        "state": "Minas Gerais",
        "neighborhood": "Tubalina",
        "zipcode": "38400123",
        "address": "Avenida Francisco Galassi",
        "number": "10",
        "complement": "Perto do shopping"
      },
      "document": "69526128664",
      "document_type": "CPF"
    },
    "producer": {
      "name": "Producer Test Name",
      "document": "12345678965",
      "legal_nature": "Pessoa Física"
    },
    "commissions": [
      {
        "value": 149.5,
        "source": "MARKETPLACE",
        "currency_value": "BRL"
      },
      {
        "value": 1350.5,
        "source": "PRODUCER",
        "currency_value": "BRL"
      }
    ],
    "purchase": {
      "approved_date": 1511783346000,
      "full_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "checkout_country": {
        "name": "Brasil",
        "iso": "BR"
      },
      "order_bump": {
        "is_order_bump": true,
        "parent_purchase_transaction": "HP02316330308193"
      },
      "event_tickets": {
        "amount": 1763247745775
      },
      "original_offer_price": {
        "value": 1500,
        "currency_value": "BRL"
      },
      "order_date": 1511783344000,
      "status": "COMPLETED",
      "transaction": "HP16015479281022",
      "payment": {
        "installments_number": 12,
        "type": "CREDIT_CARD"
      },
      "offer": {
        "code": "test",
        "coupon_code": "SHHUHA"
      },
      "sckPaymentLink": "sckPaymentLinkTest",
      "is_funnel": false,
      "business_model": "I"
    },
    "subscription": {
      "status": "ACTIVE",
      "plan": {
        "id": 123,
        "name": "plano de teste"
      },
      "subscriber": {
        "code": "I9OT62C3"
      }
    }
  }
}
```

Abandono de carrinho
```
{
  "id": "fd17c748-fa1a-405a-907f-2eb014b2f99a",
  "creation_date": 1763247745960,
  "event": "PURCHASE_OUT_OF_SHOPPING_CART",
  "version": "2.0.0",
  "data": {
    "affiliate": false,
    "product": {
      "id": 123456,
      "name": "Produto test postback2 com ç e á"
    },
    "buyer_ip": "127.0.0.1",
    "buyer": {
      "name": "Postback2 teste",
      "email": "teste@hotmart.com.br",
      "phone": "999999999"
    },
    "offer": {
      "code": "n82b9jqz"
    },
    "checkout_country": {
      "name": "Brasil",
      "iso": "BR"
    }
  }
}
```

Cancelamento de Assinatura 
```
{
  "id": "e276dd75-8c7d-43d2-8398-f42e62060b99",
  "creation_date": 1763247745837,
  "event": "SUBSCRIPTION_CANCELLATION",
  "version": "2.0.0",
  "data": {
    "actual_recurrence_value": 64.9,
    "cancellation_date": 1609181285500,
    "date_next_charge": 1617105600000,
    "product": {
      "id": 788921,
      "name": "Product name com ç e á"
    },
    "subscriber": {
      "code": "0000aaaa",
      "name": "User name",
      "email": "test@hotmart.com",
      "phone": {
        "dddPhone": "",
        "phone": "",
        "dddCell": "",
        "cell": ""
      }
    },
    "subscription": {
      "id": 4148584,
      "plan": {
        "id": 114680,
        "name": "Subscription Plan Name"
      }
    }
  }
}
```

Troca de plano
```
{
  "id": "0c0ced4b-d92d-4b2a-b438-0a6473c6b4d5",
  "creation_date": 1763247745719,
  "event": "SWITCH_PLAN",
  "version": "2.0.0",
  "data": {
    "switch_plan_date": 1553729084000,
    "subscription": {
      "subscriber_code": "9W2LNSG4",
      "status": "ACTIVE",
      "product": {
        "id": 0,
        "name": "Produto test postback2"
      },
      "user": {
        "email": "teste@hotmart.com.br"
      }
    },
    "plans": [
      {
        "id": 654321,
        "name": "Novo produto test postback2",
        "offer": {
          "key": "n6hup357"
        },
        "current": true
      },
      {
        "id": 123456,
        "name": "Plano teste com ç e á",
        "offer": {
          "key": "n6hup355"
        },
        "current": false
      }
    ]
  }
}
```

Atualização de Data de Cobrança de Assinatura
```
{
  "id": "adb0a577-8574-4fab-93e5-051473f97fb6",
  "creationDate": 1763247745640,
  "event": "UPDATE_SUBSCRIPTION_CHARGE_DATE",
  "version": "2.0.0",
  "hottok": "5M9CA6Nvtq5qhKcac6oTxmqH6teezb13df093f-77b2-49f9-9ad4-03049ccfccb6",
  "data": {
    "subscription": {
      "dateNextCharge": "2022-10-25T12:00:00.000Z",
      "newChargeDay": 1,
      "oldChargeDay": 7,
      "status": "ACTIVE",
      "product": {
        "id": 0,
        "name": "Product test postback2"
      }
    },
    "subscriber": {
      "name": "Test",
      "email": "test@hotmart.com",
      "code": "00000000"
    },
    "plan": {
      "id": 0,
      "name": "Plan Test",
      "offer": {
        "code": "000000"
      }
    }
  }
}
```
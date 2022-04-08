node-red-contrib-autodist-api-v062
================

Node-RED node for autodist-api-v062

<b>Possible error codes</b><br>HTTP 500 : E000 - Unspecified internal error<br>HTTP 401 : E001 - Authorization error<br>HTTP 423 : E002 - API access is disabled<br>HTTP 403 : E003 - Too Many Requests<br>HTTP 406 : E004 - HTTP is not allowed, use HTTPS instead<br>** HTTP 422 : E005 - The item number is restricted for processing<br>HTTP 400 : E100 - Validation error<br>HTTP 503 : E200 - Unspecified Gateway service error<br>HTTP 404 : E201 - Not found on the Gateway service side<br>HTTP 400 : E202 - No shipping options available

## Install

To install the stable version use the `Menu - Manage palette - Install` 
option and search for node-red-contrib-autodist-api-v062, or run the following 
command in your Node-RED user directory, typically `~/.node-red`

    npm install node-red-contrib-autodist-api-v062

## Usage

### Methods

#### GET /item/avail/{number}

Availability check for item with the given number

    Authorization : string
    number : string
    quantity : integer
     
    Accept : 'application/json'

#### POST /order/calculate

Calculate order parameters without order creation

    Authorization : string
    body : 
     
    Accept : 'application/json'
    Content-Type : 'application/json'

#### POST /order/create

Create order with given parameters

    Authorization : string
    body : 
     
    Accept : 'application/json'
    Content-Type : 'application/json'

#### GET /order/find

Bulk retrieve the orders by order numbers and/or order purchase numbers

    Authorization : string
    orderNumbers : array
    purchaseNumbers : array
     
    Accept : 'application/json'

#### GET /order/find/range

Bulk retrieve the orders by invoice or created date range

    Authorization : string
    dateType : string
    endDate : string
    startDate : string
     
    Accept : 'application/json'

#### GET /order/headers

Bulk retrieve the order statuses by order numbers and/or order purchase numbers. Intended to track the order statuses and tracking numbers quickly.

    Authorization : string
    orderNumbers : array
    purchaseNumbers : array
     
    Accept : 'application/json'

#### POST /order/number/cancel/{order}

Cancel order info by order number

    Authorization : string
    order : string
     
    Accept : 'application/json'

#### GET /order/number/{order}

Retrieve order info by order number

    Authorization : string
    order : string
     
    Accept : 'application/json'

#### GET /order/number/{order}/tracking-numbers

Get order's tracking numbers

    Authorization : string
    order : string
     
    Accept : 'application/json'

#### POST /order/purchase-number/cancel/{order}

Cancel order info by order purchase number

    Authorization : string
    order : string
     
    Accept : 'application/json'

#### GET /order/purchase-number/{order}

Retrieve order info by order purchase number

    Authorization : string
    order : string
     
    Accept : 'application/json'

#### GET /order/purchase-number/{order}/tracking-numbers

Get order's tracking numbers

    Authorization : string
    order : string
     
    Accept : 'application/json'


## License

#### Apache-2.0


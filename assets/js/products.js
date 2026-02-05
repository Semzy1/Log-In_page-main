// Shared product dataset for ShopEase
// Keep this file in sync with the product list used by the dashboard and homepage
const PRODUCTS = [
    // Electronics
    {id:'e1',title:'iPhone 15 Pro',cat:'electronics',price:899999.99,img:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=60',description:'Latest Apple smartphone with advanced camera system'},
    {id:'e2',title:'Samsung Galaxy S24',cat:'electronics',price:749999.99,img:'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=60',description:'Powerful Android phone with stunning display'},
    {id:'e3',title:'MacBook Pro 16"',cat:'electronics',price:2499999.99,img:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=60',description:'Professional laptop for creative work'},
    {id:'e4',title:'Sony WH-1000XM5',cat:'electronics',price:59999.99,img:'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=60',description:'Noise-canceling wireless headphones'},
    {id:'e5',title:'iPad Air',cat:'electronics',price:699999.99,img:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=60',description:'Versatile tablet for work and entertainment'},
    {id:'e6',title:'PlayStation 5',cat:'electronics',price:499999.99,img:'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=60',description:'Next-gen gaming console'},
    {id:'e7',title:'Apple Watch Series 9',cat:'electronics',price:149999.99,img:'assets/images/Apple Watch Series 9.jpg',description:'Advanced smartwatch with health monitoring'},
    {id:'e8',title:'Dell XPS 13',cat:'electronics',price:1299999.99,img:'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=60',description:'Compact laptop with powerful performance'},
    
    // Fashion
    {id:'f1',title:'Nike Air Jordan 1',cat:'fashion',price:79999.99,img:'assets/images/Nike sneakers jordan.webp',description:'Classic basketball sneakers'},
    {id:'f2',title:"Levi's 501 Jeans",cat:'fashion',price:8999.99,img:'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=60',description:'Original fit denim jeans'},
    {id:'f3',title:'Adidas Ultraboost',cat:'fashion',price:24999.99,img:'assets/images/sneakers.jpg',description:'Comfortable running shoes'},
    {id:'f4',title:'Ray-Ban Aviator',cat:'fashion',price:15999.99,img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=60',description:'Classic sunglasses with UV protection'},
    {id:'f5',title:'Zara Blazer',cat:'fashion',price:22999.99,img:'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=60',description:'Elegant formal blazer for office wear'},
    {id:'f6',title:'H&M Summer Dress',cat:'fashion',price:12999.99,img:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=60',description:'Lightweight floral print dress'},
    {id:'f7',title:'Gucci Handbag',cat:'fashion',price:299999.99,img:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=60',description:'Luxury leather handbag'},
    {id:'f8',title:'Rolex Submariner',cat:'fashion',price:8999999.99,img:'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=60',description:'Iconic luxury diving watch'},
    
    // Home & Kitchen
    {id:'h1',title:'KitchenAid Mixer',cat:'home',price:59999.99,img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=60',description:'Professional stand mixer for baking'},
    {id:'h2',title:'Dyson V11 Vacuum',cat:'home',price:89999.99,img:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=60',description:'Cordless vacuum with powerful suction'},
    {id:'h3',title:'Instant Pot Duo',cat:'home',price:15999.99,img:'https://images.unsplash.com/photo-1565402170291-8491f14678db?auto=format&fit=crop&w=800&q=60',description:'7-in-1 multi-functional pressure cooker'},
    {id:'h4',title:'Nespresso Machine',cat:'home',price:29999.99,img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=60',description:'Compact coffee maker for espresso lovers'},
    {id:'h5',title:'Memory Foam Mattress',cat:'home',price:129999.99,img:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60',description:'Queen size mattress for better sleep'},
    {id:'h6',title:'Non-Stick Cookware Set',cat:'home',price:24999.99,img:'https://images.unsplash.com/photo-1556909114-4d0d853e5e25?auto=format&fit=crop&w=800&q=60',description:'10-piece kitchen cookware set'},
    {id:'h7',title:'Smart LED TV 55"',cat:'home',price:149999.99,img:'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=60',description:'4K Ultra HD Smart Television'},
    {id:'h8',title:'Air Purifier',cat:'home',price:19999.99,img:'https://images.unsplash.com/photo-1587334984005-5eb1c96b1a2c?auto=format&fit=crop&w=800&q=60',description:'HEPA filter for clean indoor air'},
    
    // Sports & Outdoors
    {id:'s1',title:'Yoga Mat Premium',cat:'sports',price:4999.99,img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=60',description:'Non-slip exercise mat for yoga and fitness'},
    {id:'s2',title:'Wilson Tennis Racket',cat:'sports',price:12999.99,img:'assets/images/Wilson Tennis Racket.jpg',description:'Professional tennis racket for advanced players'},
    {id:'s3',title:'Bicycle Mountain Bike',cat:'sports',price:89999.99,img:'assets/images/Bicycle Mountain Bike.jpg',description:'21-speed mountain bike for trails'},
    {id:'s4',title:'Nike Football',cat:'sports',price:5999.99,img:'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&w=800&q=60',description:'Official match football'},
    {id:'s5',title:'Fitness Tracker',cat:'sports',price:8999.99,img:'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=60',description:'Activity tracker with heart rate monitor'},
    {id:'s6',title:'Camping Tent 4-Person',cat:'sports',price:29999.99,img:'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=800&q=60',description:'Waterproof tent for outdoor adventures'},
    {id:'s7',title:'Dumbbell Set 20kg',cat:'sports',price:14999.99,img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60',description:'Adjustable weight dumbbells for home gym'},
    {id:'s8',title:'Running Shoes',cat:'sports',price:12999.99,img:'assets/images/sport cap.jpeg',description:'Lightweight running shoes with cushioning'},
    
    // Beauty & Health
    {id:'b1',title:'Dyson Hair Dryer',cat:'beauty',price:49999.99,img:'assets/images/Dyson Hair Dryer.jpg',description:'Professional hair dryer with intelligent heat control'},
    {id:'b2',title:'Oral-B Electric Toothbrush',cat:'beauty',price:12999.99,img:'assets/images/Oral-B Electric Toothbrush.jpg',description:'Smart electric toothbrush with app connectivity'},
    {id:'b3',title:"L'Oreal Skincare Set",cat:'beauty',price:8999.99,img:'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=60',description:'Complete skincare routine products'},
    {id:'b4',title:'Philips Shaver',cat:'beauty',price:17999.99,img:'assets/images/Philips Shaver.jpg',description:'Electric shaver for smooth shaving'},
    {id:'b5',title:'Weight Scale Smart',cat:'beauty',price:6999.99,img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=60',description:'Digital scale with body composition analysis'},
    {id:'b6',title:'Hair Straightener',cat:'beauty',price:11999.99,img:'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=60',description:'Professional ceramic flat iron'},
    {id:'b7',title:'Perfume Gift Set',cat:'beauty',price:14999.99,img:'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=60',description:'Luxury fragrance collection'},
    {id:'b8',title:'Makeup Brush Set',cat:'beauty',price:5999.99,img:'assets/images/Makeup Brush Set.jpg',description:'Professional makeup brushes'},
    
    // Toys & Games
    {id:'t1',title:'LEGO Star Wars Set',cat:'toys',price:12999.99,img:'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=60',description:'Millennium Falcon building kit'},
    {id:'t2',title:'Nintendo Switch',cat:'toys',price:39999.99,img:'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=60',description:'Hybrid gaming console'},
    {id:'t3',title:'Barbie Dreamhouse',cat:'toys',price:19999.99,img:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=60',description:'3-story dollhouse with accessories'},
    {id:'t4',title:'Board Game Collection',cat:'toys',price:8999.99,img:'https://images.unsplash.com/photo-1632501641765-e568d28b001b?auto=format&fit=crop&w=800&q=60',description:'Family games including Monopoly and Scrabble'},
    {id:'t5',title:'Remote Control Car',cat:'toys',price:5999.99,img:'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=60',description:'High-speed RC car with rechargeable battery'},
    {id:'t6',title:'Jigsaw Puzzle 1000pc',cat:'toys',price:2999.99,img:'https://images.unsplash.com/photo-1618897992764-6c7f3685c17c?auto=format&fit=crop&w=800&q=60',description:'Landscape puzzle for adults and kids'},
    {id:'t7',title:'Drone with Camera',cat:'toys',price:49999.99,img:'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=60',description:'4K camera drone with GPS'},
    {id:'t8',title:'Play-Doh 10-Pack',cat:'toys',price:1999.99,img:'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=60',description:'Modeling compound for creative play'},
    
    // Automotive
    {id:'a1',title:'Car Phone Holder',cat:'automotive',price:2999.99,img:'assets/images/Car Phone Holder.jpg',description:'Dashboard mount for smartphones'},
    {id:'a2',title:'Jump Starter Power Bank',cat:'automotive',price:12999.99,img:'assets/images/Jump Starter Power Bank.jpg',description:'Portable car battery jump starter'},
    {id:'a3',title:'Car Vacuum Cleaner',cat:'automotive',price:7999.99,img:'assets/images/Car Vacuum Cleaner.jpg',description:'Cordless vacuum for car interior'},
    {id:'a4',title:'Dash Cam Front & Rear',cat:'automotive',price:24999.99,img:'assets/images/Dash Cam Front & Rear.jpg',description:'Dual channel driving recorder'},
    {id:'a5',title:'Car Seat Covers',cat:'automotive',price:14999.99,img:'assets/images/Car Seat Covers.jpg',description:'Universal fit neoprene seat protection'},
    {id:'a6',title:'Tire Inflator',cat:'automotive',price:8999.99,img:'assets/images/Tire Inflator.jpg',description:'Digital air compressor for car tires'},
    {id:'a7',title:'Car Wax Kit',cat:'automotive',price:5999.99,img:'assets/images/Car Wax Kit.jpg',description:'Professional car polishing and waxing'},
    {id:'a8',title:'LED Headlight Bulbs',cat:'automotive',price:12999.99,img:'assets/images/LED Headlight Bulbs.jpg',description:'Bright white headlight replacement bulbs'}
];

// Expose PRODUCTS for use by other scripts
if(typeof window !== 'undefined') window.PRODUCTS = PRODUCTS;

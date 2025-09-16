const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const stores = require('./stores.json');

const app = express();
app.use(cors());
app.use(express.json());

// Detect user country
async function getUserCountry(ip) {
    try {
        const res = await fetch(`https://ipapi.co/${ip || ''}/json/`);
        const data = await res.json();
        return data.country_code || 'US';
    } catch {
        return 'US';
    }
}

// Fetch products from affiliate APIs (placeholder functions)
async function fetchAffiliateProducts(query, store){
    return [{
        name: `${query} - ${store.name}`,
        price: "$25",
        store: store.name,
        shipping: store.region==="Worldwide"?"5-10 days":"2-5 days",
        image: "https://via.placeholder.com/150",
        ai_review:"High quality, good shipping",
        highlight: Math.random()>0.8,
        affiliate_link: store.affiliate
    }];
}

// Map store name to fetch function (replace with real API calls)
const apiMap = stores.reduce((acc, store)=> { acc[store.name] = fetchAffiliateProducts; return acc; }, {});

// Main endpoint
app.get('/apps/ai-advisor/search', async (req, res)=>{
    const { query } = req.query;
    if(!query) return res.status(400).json({error:"Query required"});

    const country = await getUserCountry(req.ip);
    let allProducts = [];

    for(let store of stores){
        if(store.region==="Worldwide" || store.region===country || store.region.includes(country)){
            const products = await apiMap[store.name](query, store);
            allProducts = allProducts.concat(products);
        }
    }

    res.json(allProducts);
});

app.listen(3000,()=>console.log('AI Advisor backend running on port 3000'));

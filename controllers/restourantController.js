const Product = require('../models/product');
const Category = require('../models/category');
const axios = require('axios');
require('dotenv').config();

const placeId = process.env.GOOGLE_PLACE_ID;
const apiKey = process.env.GOOGLE_API_KEY;

async function getGoogleReviews(placeId, apiKey) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=tr&key=${apiKey}`;
    
    try {
        const response = await axios.get(url);
        return response.data.result.reviews;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}
    exports.getIndex = (req, res, next) => {
        getGoogleReviews(placeId, apiKey)
            .then(reviews => {
                Category.find()
                    .then(categories => {
                        res.render('restourant/index', {
                            title: 'Restourant',
                            path: '/',
                            user: req.session.user,
                            categories: categories,
                            reviews: reviews 
                        })
                    })
            })
            .catch(error => {
                console.error('Error getting reviews:', error);
                res.render('restourant/index', {
                    title: 'Restourant',
                    path: '/',
                    user: req.session.user,
                    categories: [], 
                    reviews: [] 
                });
            });}


exports.getAbout =(req,res,next)=>{
    res.render('restourant/about',{
        title:'About',
        path:'/about',
        user:req.session.user
    })
}

exports.getGalery =(req,res,next)=>{
    const cafeImages = [
        {filename: `img/cafe_images/cafe_bg1.jpg`, alt: `Cafe image`},
        {filename: `img/cafe_images/cafe_bg2.jpg`, alt: `Cafe image`},
        {filename: `img/cafe_images/cafeImg-1.jpg`, alt: `Cafe image`},
        {filename: `img/cafe_images/cafeImg-2.jpg`, alt: `Cafe image`},
        {filename: `img/cafe_images/cafeImg-4.jpg`, alt: `Cafe image`},
        {filename: `img/cafe_images/cafeImg-5.jpg`, alt: `Cafe image`},
        {filename: `img/cafe_images/cafeImg-7.jpg`, alt: `Cafe image`},
    ]
    res.render('restourant/galery',{
        title:'Galery',
        path:'/galery',
        user:req.session.user,
        cafeImages:cafeImages
    })
}


//Product
exports.getProducts=(req,res,next)=>{

    Product.find()
        .then(products=>{
            return products;
        })
        .then(products=>{
            Category.find()
                .then(categories=>{
                    res.render('restourant/products',{
                        title:'Products',
                        path:'/products',
                        products:products,
                        user:req.session.user,
                        categories:categories
                    });
                })
            
        })
        .catch(err=>{console.log(err)})
        //Category işlemleri
        //.then(products=>{})
}

exports.getProduct=(req,res,next)=>{
    Product
        .findOne({_id:req.params.productid})
        .then(product=>{
            res.render('restourant/product-detail',{
                title:product.name,
                product:product,
                path:'/products',
                user:req.session.user
            })
        })
        .catch(err=>{console.log(err)});
}







//Menu 
exports.getMenu =(req,res,next)=>{
    res.render('restourant/menu',{
        title:'Menu',
        path:'/menu',
        user:req.session.user
    })
}

exports.postMenu=(req,res,next)=>{
    res.render('restourant/menu',{
        title:'Menu',
        path:'/menu',
        user:req.session.user
    })
}
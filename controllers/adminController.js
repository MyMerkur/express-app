const Reservation = require('../models/reservation');
const Product = require('../models/product');
const Category = require('../models/category');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const fs = require('fs');
const product = require('../models/product');


// All Reservations
async function getAllReservations() {
    try {
        return await Reservation.find();
    } catch (err) {
        throw err;
    }
}

// isSubmit Reservations
async function getConfirmedReservations() {
    try {
        return await Reservation.find({ isSubmit: true });
    } catch (err) {
        throw err;
    }
}

exports.getAdminReservation = async (req, res, next) => {
    try {
        const allReservations = await getAllReservations();
        const confirmedReservations = await getConfirmedReservations();

        const pendingReservations = allReservations.filter(reservation => !reservation.isSubmit);

        res.render('admin/admin-reservation', {
            title: 'Admin Reservation',
            path: '/admin/admin-reservation',
            user: req.session.user,
            reservations: pendingReservations,
            action: req.query.action,
            confirmedReservations: confirmedReservations
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

exports.postSubmit = async (req, res, next) => {
    try {
        const reservationId = req.body.reservationid;
        const result = await Reservation.updateOne({ _id: reservationId }, { isSubmit: true });
        const email = req.session.user.email; 
        console.log(email);
        if (result.nModified === 0) {
            console.log('Onaylama başarısız');
        } else {
            console.log('Rezervasyon Onaylandı');
        }

        res.redirect('/admin/admin-reservation?action=submit');

        const msg = {
            to: email, 
            from: 'dogukan755@icloud.com', 
            subject: 'Agara Cafe Restorant Rezervasyonunuz Onaylandı',
            html: '<strong>Rezervasyon Onaylandı</strong>',
          }
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')
            })
            .catch((error) => {
              console.error(error)
            })
    } catch (err) {
        console.log(err);
        next(err);
    }
}

exports.postDelete = async (req, res, next) => {
    try {
        const reservationId = req.body.reservationid;
        const result = await Reservation.deleteOne({ _id: reservationId });

        if (result.deletedCount === 0) {
            console.log('Silme başarısız');
            return res.redirect('/admin/admin-reservation');
        }

        res.redirect('/admin/admin-reservation?action=delete');
    } catch (err) {
        console.log(err);
        next(err);
    }
};

//Product

exports.getProducts=(req,res,next)=>{
    Product
        .find()
        .populate({
            path: 'categories',
            model: 'Category',
            select:'name description imageUrl'
        })
        .then(products=>{
            Category.find()
                .then(categories=>{
                    console.log(categories)
                    res.render('admin/products',{
                        title:'Admin Products',
                        path:'/admin/products',
                        action:req.query.action,
                        products:products,
                        categories:categories,
                        user:req.session.user
                    })
                })
                .catch(err=>{console.log(err)})            
        })        
}

exports.getAddProduct=(req,res,next)=>{
    Category.find()
        .then(categories=>{
            res.render('admin/add-product', {
                title: 'New Product',
                path: '/admin/add-product',
                user: req.session.user,
                action: req.query.action,
                categories: categories
            });
        })
        .catch(err=>{console.log(err)});
}

exports.postAddProduct=(req,res,next)=>{
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const image = req.file;

    if(!image){
        return res.render('admin/add-product', {
            title: 'New Product',
            path: '/admin/add-product',
            errorMessage:'Lütfen bir resim ekleyiniz',
            inputs:{
                name:name,
                price:price,
                description:description
            }
        });
    }
    const product = new Product({
        name:name,
        price:price,
        description:description,
        categories:categoryId,
        imageUrl:image.filename
    });
        product.save()
            .then(()=>{
                res.redirect('/admin/products');
            })
            .catch(err=>{console.log(err)})
}

exports.getEditProduct = (req, res, next) => {
    Product.findOne({ _id: req.params.productid ,})
        .then(product => {
            console.log(product);
            if (!product) {
                return res.redirect('/');
            }
            return Category.find().then(categories => ({ product, categories }));
        })
        .then(({ product, categories }) => {
            categories = categories.map(category => {
                if (product.categories) {
                    product.categories.find(item => {
                        if (item.toString() === category._id.toString()) {
                            category.selected = true;
                        }
                    });
                }
                return category;
            });
            res.render('admin/edit-product', {
                title: 'Edit Product',
                path: '/admin/products',
                product: product,
                categories: categories,
                user: req.session.user,
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};


exports.postEditProduct=(req,res,next)=>{
    const productid = req.body.productid;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const image = req.file;

    const product = {
        name:name,
        price:price,
        description:description,
        categories:categoryId
    };

    Product.findOne({_id:productid})
        .then(product=>{
            if(!product){
                return res.redirect('/');
            }
            product.name = name;
            product.price = price;
            product.description = description;
            product.categories = categoryId;

            if(image){
                fs.unlink('public/img/'+product.imageUrl,err=>{
                    if(err)console.log(err);
                })
                product.imageUrl = image.filename;
            }
            return product.save();
        }).then(result=>{
            res.redirect('/admin/products?action=edit');
        }).catch(err=>{console.log(err)});
}

exports.postDeleteProduct=(req,res,next)=>{
    const id = req.body.productid;

    Product.findOne({_id:id})
        .then(product=>{
            if(!product){
                return next(new Error('Silmek istediğiniz ürün bulunamadı'));
            }
            fs.unlink('public/img/'+product.imageUrl,err=>{
                if(err){console.log(err)}
            });
            return Product.deleteOne({_id:id})
        })
        .then((result)=>{
            if(result.deletedCount === 0){
                return res.redirect('/');
            }
            res.redirect('/admin/products?action=delete');
        })
        .catch(err=>{console.log(err)});
}

//Categories

exports.getCategories=(req,res,next)=>{
    Category.find()
        .then(categories=>{
            console.log(categories)
            res.render('admin/categories',{
                title:'Categories',
                path:'/admin/categories',
                categories:categories,
                action:req.query.action,
                user:req.session.user
            });
        })
        .catch(err=>{console.log(err)});
}

exports.getAddCategory=(req,res,next)=>{
    res.render('admin/add-category',{
        title:'New Category',
        path:'/admin/add-category',
        user:req.session.user
    })
}

exports.postAddCategory=(req,res,next)=>{
    const name = req.body.name;
    const description = req.body.description;

    const category = new Category({
        name:name,
        description:description
    });
    category.save()
        .then(result=>{
            res.redirect('/admin/categories?action=create')
        })
        .catch(err=>{console.log(err)});
}

exports.getEditCategory=(req,res,next)=>{
    Category.findById(req.params.categoryid)
    .then(category=>{
        res.render('admin/edit-category',{
            title:'Edit Category',
            path:'/admin/edit-category',
            category:category,
            user:req.session.user
        })
    })
    .catch(err=>{console.log(err)});
}

exports.postEditCategory=(req,res,next)=>{
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;

    Category.findById(id)
        .then(category=>{
            category.name = name;
            category.description = description;
            return category.save();
        })
        .then(()=>{
            res.redirect('/admin/categories?action=edit')   
        })
        .catch(err=>{console.log(err)});
}

exports.postDeleteCategory=(req,res,next)=>{
    const id = req.body.categoryid;

    Category.deleteOne({_id:id})
        .then(()=>{
            res.redirect('/admin/categories?action=delete')
        })
        .catch(err=>{console.log(err)});
}
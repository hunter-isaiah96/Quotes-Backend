var express = require('express');
var router = express.Router();
var async = require('async');

module.exports = function(app){
	var Cloudinary = app.cloudinary;
	var Quote = app.models.Quote;

	router.get('/api/get/:id', function(req, res){
		Quote.findOne({_id: req.params.id}, function(err, quote){
			if(err || !quote){
				throw err;
			}else{
				res.status(200).json({success: true, quote: quote})
			}
		})
	})

	router.get('/api/get', function(req, res){
		Quote.find({}, function(err, quotes){
			if(err){
				throw err;
			}else{
				res.status(200).json({success: true, quotes: quotes})
			}
		})
	})

	router.delete('/api/delete/:id', function(req, res){
		Quote.findOneAndRemove({_id: req.params.id}, function(err, quote){
			if(err){
				throw err;
			}else{
				Cloudinary.v2.uploader.destroy(quote.quoter_image.public_id, function(err, cl_res){
					if(err){
						throw err;
					}else{
						res.status(200).json({success: true});
					}
				});
				
			}
		})
	})

	router.put('/api/edit', function(req, res){
		var updateStuff = {
			quote: req.body.quote,
			quoter: req.body.quoter
		}
		async.series([
			function(callback){
				if(req.body.image == null){
					return callback(null, null);
				}
				Cloudinary.v2.uploader.upload('data:' + req.body.image.filetype + ';base64,' + req.body.image.base64, {public_id: req.body.quoter_image.public_id}, function(err, cl_res){
					if(err){
						return callback({success: false, msg: 'There was a problem overriding the image'});
					}
					updateStuff.quoter_image = cl_res;
					callback(null, null);
				});
			},
			function(callback){
				Quote.findOneAndUpdate({_id: req.body._id}, updateStuff, function(err, quote){
					if(err || !quote){
						return callback({success: false, msg: 'There was a problem updating this article'});
					}
					callback(null, null)
				})
			}
		], function(err, succ){
			if( err) {
				return res.status(500).json(err);
			} else {
				return res.status(200).json({success: true, msg: 'Success'});
			}
		});
	})

	router.post('/api/new', function(req, res){
		var newQuote = new Quote({
			quote: req.body.quote,
			quoter: req.body.quoter
		})
		Cloudinary.v2.uploader.upload(`data:${req.body.image.filetype};base64,${req.body.image.base64}`, function(err, cl_res){
			if (err) {
				return res.json({success: false, msg: 'There was a problem uploading this image'});
			} else {
				newQuote.quoter_image = cl_res;
				newQuote.save(function(err, quote){
					if (err || !quote){
						throw err;
					} else {
						res.status(200).json({success: true, msg: 'Successfully submitted Quote'})
					}
				})
			}
		})
	})

	return router;
};

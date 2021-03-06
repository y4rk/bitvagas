var express = require('express')
  , db      = require('../../../models')
  , _       = require('lodash');

module.exports = {

    findAll: function(request, response){
        db.org.findAll({ include: [ db.job ] }).then(function(orgs){
            response.status(200).json(orgs);
        });
    }

    , findByUser: function(request, response){
        db.org.findAll({
            where : { USER_ID : request.user.id  }
        }).then(function(orgs){
            response.status(200).json(orgs);
        });
    }

    , read: function(request, response){
        response.json(request.org);
    }

    , create: function(request, response){
        if(!request.user)
            return response.status(400).send('errorMessage.user.not.found');

        request.body.USER_ID = request.user.id;

        db.org.create(request.body).then(function(org){
            response.status(201).json(org);
        }).catch(function(error){
            response.status(400).json(error);
        });
    }

    , edit: function(request, response){
        var org = request.org;
        org = _.extend(org, request.body);
        org.save().then(function(org){
            response.status(201).json(org);
        }).catch(function(error){
            response.status(400).json(error);
        });
    }

    , delete: function(request, response){
        var org = request.org;
        org.destroy().then(function(){
            return response.status(204).send('deleted');
        }).catch(function(err){
            console.log(err);
            if(err.parent.table === 'jobs')
                return response.status(400).send("delete.jobs");

            return response.status(400).json(err);
        });
    }

    /*
     * Middleware for OrgID parameter
     */
    , findById: function(request, response, next, OrgID){
        db.org.find({ where : { id : OrgID }}).then(function(org){
            if(!org) response.status(400).send('errorMessage.org.not.found');
            request.org = org;
            next();
        }).catch(function(err){
            next(err);
        });
    }
};

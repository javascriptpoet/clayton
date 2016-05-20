/**
 * Created by dmitry on 3/1/16.
 */

imageStore = new FS.Store.GridFS("images", {
    maxTries: 2, // optional, default 5
    chunkSize: 512000  // optional, default GridFS chunk size in bytes (can be overridden per file).
    // Default: 2MB. Reasonable range: 512KB - 4MB
});
Images = new FS.Collection("images", {
    stores: [imageStore]
});

var tableSettings={
    showFilter:false,
    showNavigation:'never',
    showNavigationRowsPerPage:false
};

//relationships
jspAfRelations.addRel('postsRel',{
    colName: "posts",
    displayMode:'tabletable',
    table:_.extend({
        fields: [
            {key: 'tag', label: 'Tag'},
            {key: 'comment', label: 'Comment'}
        ]
    },tableSettings)
});
jspAfRelations.addRel('projectsRel',{
    colName: "projects",
    displayMode:'tabletable',
    table: _.extend({
        fields:[
            {key:'title',label:'Title'},
            {key:'mainImage',label:'Main image'},
            {key:'createdAt', label:'Date created'}
        ]
    },tableSettings)
});
jspAfRelations.addRel('tagsRel',{
    colName: "tags",
    displayMode:'tabletable',
    table: _.extend({
        fields:[
            {key:'tag',label:'tag'},
            {key:'comment',label:'comment'}
        ]
    },tableSettings)
});

Tags=new Mongo.Collection('tags');
Tags.attachSchema(new SimpleSchema({
    tag:{
        type:String,
        label:'Tag',
        unique:true
    },
    comments:{
        type: String,
        label: "Comments",
        optional:true,
        autoform:myApp.getSummernoteAttr()
    },
    related: {
        type: String,
        label: 'items tagged by this tag',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'jspAfRelations',
                rels: ['postsRel','projectsRel']
            }
        }
    }
}));

Projects=new Mongo.Collection('projects');
Projects.attachSchema(new SimpleSchema({
    title: {
        type: String,
        label:'Title',
        unique:true
    },
    mainImage: {
        type: [String],
        label: 'main image',
        optional:true
    },
    'mainImage.$':{
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: "images"
            }
        }
    },
    related: {
        type: String,
        label: 'Related',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'jspAfRelations',
                rels: ['postsRel','tagsRel']
            }
        }
    },
    body: {
        type: String,
        label: "Desription",
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor', // optional
                settings: myApp.getSummernoteAttr()
            }
        }
    },
    createdAt: {
        type: Date,
        label: 'Date',
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            }
        }
    }
}));

Posts = new Meteor.Collection('posts');
Posts.attachSchema(new SimpleSchema({
    title: {
        type: String,
        label:'Title',
        unique:true
    },
    mainImage: {
        type: [String],
        label: 'main image',
        optional:true
    },
    'mainImage.$':{
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: "images"
            }
        }
    },
    related: {
        type: String,
        label: 'items tagged by this tag',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'jspAfRelations',
                rels: ['projectsRel','tagsRel']
            }
        }
    },
    body: {
        type: String,
        label: "Yet another poem",
        optional:true,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor', // optional
                settings: myApp.getSummernoteAttr()
            }
        }
    },
    createdAt: {
        type: Date,
        label: 'Date',
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            }
        }
    }
}));

// config for cms/admin/dashboard
AdminConfig = {
    adminEmails: ['skihappy@hotmail.com'],
    collections:
    {
        'Posts':{
            waitOn:function(){
                return [
                    Meteor.subscribe('images')
                ]
            },
            tableColumns: [
                {name:'title',label:'Title'},
                {name:'mainImage',label:'Main image'},
                {name:'summary',label:'Summary'},
                {name:'createdAt', label:'Date created'}
            ]
        },
        'Projects':{
            waitOn:function(){
                return [
                    Meteor.subscribe('images')
                ]
            },
            tableColumns: [
                {name:'title',label:'Title'},
                {name:'mainImage',label:'Main image'},
                {name:'summary',label:'Summary'},
                {name:'createdAt', label:'Date created'}
            ]
        },
        'Tags':{
            tableColumns: [
                {name:'tag',label:'Tag'},
                {name:'comments',label:'Comments'},
            ]
        }
    }
};
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
    relations:{
        type:String,
        label:'Tagged by this tag',
        optional:true,
        autoform:{
            afFieldInput: {
                type:'relations',
                data:{
                    relNames:['PostsToTags','ProjectsToTags']
                }
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
    relations: {
        type: Object,
        label: 'Associated posts and tags',
        optional:true,
        autoform:{
            afFieldInput: {
                type:'relations',
                data: {
                    relNames:['ProjectsToPosts','ProjectsToTags']
                }
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
    relations: {
        type: String,
        label: 'Associated projects and tags',
        optional:true,
        autoform:{
            afFieldInput: {
                type:'relations',
                data:{
                    relNames:['ProjectsToPosts','PostsToTags']
                }
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
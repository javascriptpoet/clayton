/**
 * Created by dmitry on 3/1/16.
 */
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
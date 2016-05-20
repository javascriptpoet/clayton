/**
 * Created by dmitry on 2/28/16.
 */
    //debugger;
getRelColSel=function (opts) {
    return {
        $or: [
            {
                $and: [
                    {'sides.0.docId': opts.myDocId, 'sides.0.colName': opts.myColName},
                    {'sides.1.colName': opts.otherColName}
                ]
            },
            {
                $and: [
                    {'sides.1.docId': opts.myDocId, 'sides.1.colName': opts.myColName},
                    {'sides.0.colName': opts.otherColName}
                ]
            }
        ]
    }
};
function getInsSel(sides){
    return {
        $or: [
            {
                'sides.0':sides[0],
                'sides.1':sides[1]
            },
            {
                'sides.1':sides[0],
                'sides.0':sides[1]
            }
        ]
    }
};

jspAfRelations= {
    _rels:{},
    getRel:function(name){
        return this._rels[name]
    },
    addRel:function(name,rel){
        /*
        rel{[object]}
            colName {string} - name of the related collection
            label{string} optional - short label to display in the tab, colName if not supplied. html
            title {string} optional - description to display in the panel. html
            displayMode{string} optional - a switch to specify how widget will be displayed.
                'table-table'
                'btn-table'
                'btn-btn'
            table {object} optional - if table is specified by display option, defines table settings per tabular:meteor-tabular,
                if columns not supplied, all the fields except _id will be displayed
            btnField{string} optional - field to be subscribed and displayed in the buttons. 'title' or _id if not supplied
            btnTemplateName {string} optional- if btn is specified by display opt,template to display it. all the specified fields are passed as context
            relTemplateName {string} optional - template for relationship display, has to handle selection and insertion functionality by itself
            relatedDocSel{object} optional = additional custom selector for related collection colName
            relSel{object} optional - additional custom selector for relations collection. use to filter users
            deny {function(relDoc)} opt - predicate func to deny insert or remove on rels collection
     */
        this._rels[name]= _.extend(_.clone(rel),{name:name})
    },
    relsCollection: new Mongo.Collection('jsp-relations'),
    getRelatedDocs:function(opts){
        /*opts:myColName,otherColName,myDocId,otherColFields,relSel,otherSel*/
        //first, get all ids of related docs from relations collection
        var opts= _.clone(opts),
            otherCol=Mongo.Collection.get(opts.otherColName),
            relatedIds=this.relsCollection.find(getRelColSel(opts)).map(function(doc) {
                if (doc.sides[0].colName === opts.myColName) {
                    return doc.sides[1].docId
                } else {
                    return doc.sides[0].docId
                }
            });
        // now, pull those ids out of the related collection
        return {
            in:otherCol.find({_id: {$in: relatedIds}}),
            nin:otherCol.find({_id: {$nin: relatedIds}})
        }
    }
}

if(Meteor.isServer) {
    //this is publication for default behaviour
    /* relSel{object} - for relations collection
     sidesSel {array} - arrray of two selectors, one for each side of the relationship
        colName{string}
        sel{object}
     */
    Meteor.publish('jspRels', function (opts/*myColName,otherColName,myDocId,otherColFields*/) {
        var otherCol=Mongo.Collection.get(opts.otherColName);
        return [
            jspAfRelations.relsCollection.find(getRelColSel(opts)),
            opts.otherCol.find({},{fields: opts.otherColFields})
        ]
    });
    Meteor.methods({
        jspRelRemove:function(opts){
            /*opts: {object}
             fromColName:string
             fromDocId: string
             toDocId: string
             toRelName: string
             * */
            var toRel=jspAfRelations.getRel(opts.toRelName),
                reason=toRel.deny && toRel.deny(_.extend(opts,{type:'remove'})),
                sides=[
                    {docId:opts.fromDocId,colName:opts.fromColName},
                    {docId:opts.toDocId,colName:toRel.colName}
                ];
            if(reason) Meteor.Error('jspRelError',reason);
            jspAfRelations.relsCollection.remove(getInsSel(sides))
        },
        jspRelInsert:function(opts){
            /*opts: {object}
                fromColName:string
                fromDocId: string
                toDocId: string
                toRelName: string
                extra: object

             * */
            var toRel=jspAfRelations.getRel(opts.toRelName),
                reason=toRel.deny && toRel.deny(_.extend(opts,{type:'insert'})),
                sides=[
                    {docId:opts.fromDocId,colName:opts.fromColName},
                    {docId:opts.toDocId,colName:toRel.colName}
                ];
            if(reason) Meteor.Error('jspRelError',reason);
            jspAfRelations.relsCollection.upsert(
                getInsSel(sides),
                _.extend(
                    {sides:sides},
                    opts.extra,{
                        userId:Meteor.userId(),
                        createdAt:Date.now()
                    }
                )
            )
        }
    })
}




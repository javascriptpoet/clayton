/**
 * Created by dmitry on 2/27/16.
 */


Meteor.startup(function() {
    Template['jspAfRel'].helpers({
        getTopTemplate:function(){
            return this.atts.topTemplate || 'jspReltoptemplate'
        },
        getValue:function(){
            return JSON.stringify(this.value.get())
        },
        getSchemaKey:function(){
            return this.atts['data-schema-key']
        }
    });

    Template['jspReltoptemplate'].helpers({
        getPanelTemplate:function(rel){
            return rel.relTemplateName || 'jspRel'+rel.displayMode;
        },
        getRelLabel:function(rel){
            return rel.label || rel.colName
        },
        getSelItemCount:function(rel){
            return jspAfRelations.relsCollection.find(getRelColSel({
                myColName: AutoForm.getFormCollection()._name,
                otherColName: rel.colName,
                myDocId:this.docId,
            })).count()
        }
    });

    _.each(['jspReltabletable'/*,'jspRel-btn-table','jspRel-btn-btn'*/],function(tmplName){
        Template[tmplName].onCreated(function panelCreate(){
            //do the subscription, either default or the supplied in rel options
            // for the default subscription, each subscribes to all relevant records in
            //relationship collection and the specified fields of the entire collection on the other side of the relationship
            //if docid is not defined, its insert form. the af field will not display, so dont bother subscribing
            if(!AutoForm.getCurrentDataForForm().doc._id) return;
            var rel=this.data,
                myColName=AutoForm.getFormCollection()._name;
            var fields={},
                btnField={},
                cols=rel.table.fields;
            //we need to extend the columns with _id but keep it hidden as default
            if(!_.findWhere(cols,{key:'_id'})){
                cols.push({key:'_id',label:'doc id',hidden:true})
            }
            if((rel.displayMode==='btn-btn') || (rel.displayMode==='btntable')){
                fields[rel.btnField || 'title']=1;
            };
            if((rel.displayMode==='tabletable') || (rel.displayMode==='btntable')){
                fields=_.extend(
                    fields,
                    _.reduce(
                        (rel.table || {columns:[{key:'title'}]}).columns,
                        function(memo,col){
                            memo[col.key]=1;
                            return memo;
                        },{})
                )
            }
            Template.instance().subscribe('jspAfRel', {
                myColName: myColName,
                otherColName: rel.colName,
                myDocId:rel.docId,
                fields:fields
            });
        });
        Template[tmplName].helpers({
            getTableCursor:function(arg){
                //first, we'll get all the related doc ids from the relations collection
                return jspAfRelations.getRelatedDocs({
                    myColName: AutoForm.getFormCollection()._name,
                    otherColName: this.colName,
                    myDocId:AutoForm.getCurrentDataForForm().doc._id,
                    relSel:this.relSel,
                    otherSel:this.relatedDocSel
                })[arg.hash.type==='selItems'?'in':'nin']
            },
            getRelLabel:function(){
                return this.label || this.colName
            },
        });
        Template[tmplName].events({
            'click .reactive-table tbody tr': function (e, t) {
                var rel = t.data,
                    myDocId= AutoForm.getCurrentDataForForm().doc._id,
                    myColName=AutoForm.getFormCollection()._name,
                    doc=this,
                    el = $(e.target).closest('.reactive-table');

                var clickedId=$(el).attr('id'),
                    clickedClass=$(el).attr('id'),
                    opts={
                        fromDocId:myDocId,
                        fromColName:myColName,
                        toDocId:doc._id,
                        toRelName:rel.name
                    };

                if ($(el).attr('id') === 'sel-items-table') {
                    //if clicked row in selected items table, then, remove relationship
                    Meteor.call('jspRelRemove',opts)
                } else {
                    Meteor.call('jspRelInsert',opts)
                }
            }
        });
    })

//now we can register the field and relax
    AutoForm.addInputType('jspAfRelations', {
        template: 'jspAfRel',
        valueOut: function () {
            return this.val();
        },
        contextAdjust: function (context) {
            context.docId=AutoForm.getCurrentDataForForm().doc?
                AutoForm.getCurrentDataForForm().doc._id:
                0;
            context.value = new ReactiveVar(context.value || []);
            context.rels= _.map(context.atts.rels,function(relName){
               return jspAfRelations.getRel(relName)
            });
            return context;
        }
    });
})

/**
 * Created by dmitry on 2/27/16.
 */
//some helpers
function getSelector(rel,myDocId){
    var key=(rel.otherSide.key || 'relations')+'.'+rel.relName,
        sel1={},sel2={};
    sel2[key]={$in:[myDocId]};
    sel1[key]={exists:true};
    return {$and:[sel1,sel2]};
};
Meteor.startup(function() {
    Template.afInputRelations.onCreated(function () {
        var self=this,
            data = self.data,
            formData = data.formData,
            myColName=AutoForm.getFormCollection()._name,
            myDocId=data.docId;
        //for each relationship where the other side is heavy, subscribe to the items referencing this doc
        //that is if the doc._id is available. it will not be for insert type of forms. still, will be able to reference
        //items for relationships where this side is heavy
        _.each(data.rels,function(rel){
            if (rel.otherSide.side==='heavy' && myDocId)
                self.subscribe('jspAfRel-otherHeavySide', myDocId,myColName,rel.relName);
        });
    });

    Template.afInputRelations.helpers({
        getTable:function(){
            return this.otherSide.table
        },
        getSampleTable:function(){
            return myApp.sampleTable;
        },
        getAttr: function () {
            return _.omit(this.atts, 'data-schema-key')
        },
        schemaKey: function () {
            return this.atts['data-schema-key']
        },
        getValue: function () {
            return this.value.get()
        },
        getRel: function () {
            //returns name/label of one of relationships monitored by this field (passed as data arg to the template)
            return this.curRel.get();
        },
        getSelItemCount: function () {  //returns number of items referenced on the other side of a relationship
            var rel = this,
                data=Template.instance().data;
            if (rel.mySide.side === 'heavy') {
                //references are imbeded on this side in this field
                var valRel = (data.value.get() || {})[rel.relName];
                return valRel ? valRel.items.count : 0;
            } else {  //references imbeded on the other side.
                return rel.otherSide.collection.find(getSelector(rel,data.docId)).count()
            }
        },
        getTableSelector: function (kw/*type*/) {
            var type=kw.hash.type,
                rel=this,
                data=Template.instance().data,
                value = data.value.get() || {},
                relValue = value[rel.relName] || {items:[{_id:0}]};
            if (rel.mySide.side === 'heavy') {
                if (type === 'selItems') {
                    return {_id: {$in: _.pluck(relValue.items, '_id')}}
                } else {
                    return {_id: {$nin: _.pluck(relValue.items, '_id')}}
                }
            } else {
                var ids= rel.otherSide.collection.find(getSelector(rel,data.docId)).fetch();
                if (type === 'selItems') {
                    return {_id: {$in:ids}}
                } else {
                    return {_id: {$nin: ids}}
                }
            }
        }
    });

    Template.afInputRelations.events({
        'click #avail-sel': function (e, t) {
            t.data.curRel.set(Blaze.getData(e.target));
            $('#chev-avail').click();
        },
        'click #sel-sel': function (e, t) {
            t.data.curRel.set(Blaze.getData(e.target));
            $('#chev-sel').click();
        },
        'click #chev-sel,#chev-avail': function (e, t) {
            var el= e.target;
            if ($(el).hasClass('glyphicon-chevron-down')) {
                $(el).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            } else if ($(el).hasClass('glyphicon-chevron-up')) {
                $(el).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            }
        },
        'click tbody > tr': function (e, t) {
            var tableEl = $(e.target).closest('table'),
                dataTable = tableEl.DataTable(),
                rowData = dataTable.row(e.currentTarget).data();
            if (!rowData) return; // Won't be data if a placeholder row is clicked
            var rel = t.data.curRel.get(),
                oldVal = value('get'),
                relVal = oldVal[rel.relName];

            function value(action, val) {
                if (action === 'get') {
                    return (rel.mySide.side === 'heavy') ?
                        t.data.value.get() :
                        rel.otherSide.collection.find({_id: rowData._id}).fetch()[0][rel.otherSide.key]
                } else {
                    if (rel.mySide.side === 'heavy') {
                        t.data.value.set(val)
                    } else {
                        var modifier = {};
                        modifier[rel.otherSide.key] = val;
                        rel.otherSide.collection.update({_id: rowData._id}, modifier)
                    }
                }
            }

            var id = (rel.mySide.side === 'heavy') ? rowData._id : t.data.docId;
            if ($(tableEl).attr('id') === 'sel-items-table') {
                //if clicked row in selected items table, then, remove from selected
                relVal.items = _.reject(relVal.items, function (item) {
                    return item._id === id
                })
            } else {
                var newItem = {
                    _id: id,
                    userId: Meteor.userId(),
                    time: Date.now()
                };
                if (relVal) {
                    relVal.items.push(newItem)
                } else {
                    oldVal = {};
                    oldVal[rel.relName] = [newItem];
                }
            }
            value('set', oldValue);
        }
    });

//now we can register the fields and relax
    AutoForm.addInputType('relations', {
        template: 'afInputRelations',
        valueOut: function () {
            return this.val();
        },
        contextAdjust: function (context) {
            //digest relationships names into data relevant to whatever side of relationship the form's collection is
            context.rels = _.map(context.relNames, function (relName) {
                return _.defaults(
                    {relName: relName},
                    jspAfRelations.getRightSide(AutoForm.getFormCollection(), relName)
                )
            });
            context.formData = AutoForm.getCurrentDataForForm();
            context.docId=context.formData.doc?context.formData.doc._id:0;
            context.value = new ReactiveVar(context.value);
            context.curRel = new ReactiveVar(context.rels[0]);
            return context;
        }
    });
})

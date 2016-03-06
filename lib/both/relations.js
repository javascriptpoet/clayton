/**
 * Created by dmitry on 3/1/16.
 */
postsSide={
    collection:Posts,
    table:{
        columns:[
            {data:'title',title:'Title'},
            {data:'mainImage',title:'Main image'},
            {data:'summary',title:'Summary'},
            {data:'createdAt', title:'Date created'}
        ]
    }
};
projectsSide={
    collection: Projects,
    table:{
        columns:[
            {data:'title',title:'Title'},
         /*   {data:'mainImage',title:'Main image'},
            {data:'summary',title:'Summary'},
            {data:'createdAt', title:'Date created'}*/
        ]
    }
};
tagsSide={
    collection: Tags,
    table: {
        columns: [
            {data: 'tag', title: 'Tag'},
        /*    {data: 'comment', title: 'Comment'}*/
        ]
    }
};

//define relationships
jspAfRelations.addRel('PostsToTags',{
    heavySide:postsSide,
    lightSide: tagsSide
});
jspAfRelations.addRel('ProjectsToTags',{
    heavySide: projectsSide,
    lightSide: tagsSide
});
jspAfRelations.addRel('ProjectsToPosts',{
    heavySide: projectsSide,
    lightSide:postsSide
});
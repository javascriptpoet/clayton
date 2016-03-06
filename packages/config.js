/**
 * Created by dmitry on 2/17/16.
 */
Blog.config({
    title: "Meteor Blog Example",
    syntaxHighlighting: true,
    syntaxHighlightingTheme: 'github',
    blogIndexTemplate: 'blog',
    blogShowTemplate: 'show',
    comments: {
        disqusShortname: 'claytonspacecows',
        useDisqus: true, // default is false
        allowAnonymous: true   // default is false
    },
    rss: {
        title: 'Example Blog App',
        description: 'This is an example application for meteor-blog package'
    }
});
Comments.ui.config({
    limit: 20, // default 10
    loadMoreCount: 20, // default 20
    template: 'bootstrap', // default 'semantic-ui'
    markdown: true // default false
});
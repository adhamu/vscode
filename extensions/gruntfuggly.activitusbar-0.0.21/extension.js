
var vscode = require( 'vscode' );

function activate( context )
{
    var viewNames = [];
    var commands = [];
    var buttons = [];
    var open = 'hide';
    var tooltips = {
        "explorer": "Explorer",
        "search": "Search",
        "scm": "Source Control",
        "debug": "Debug",
        "extensions": "Extensions"
    };
    var priority;
    var startingPriority;

    String.prototype.capitalize = function()
    {
        return this.replace( /(?:^|\s)\S/g, function( a ) { return a.toUpperCase(); } );
    };

    function inactiveColour()
    {
        return vscode.workspace.getConfiguration( 'activitusbar' ).get( 'inactiveColour' ) || new vscode.ThemeColor( 'statusBar.foreground' );
    }

    function activeColour()
    {
        return vscode.workspace.getConfiguration( 'activitusbar' ).get( 'activeColour' );
    }

    function build()
    {
        function deselect()
        {
            viewNames.forEach( function( view )
            {
                if( buttons[ view ] )
                {
                    buttons[ view ].color = inactiveColour();
                }
            } );
        }

        function showView( view )
        {
            deselect();
            vscode.commands.executeCommand( 'workbench.view.' + view );
            if( buttons[ view ] )
            {
                buttons[ view ].color = activeColour();
            }
            open = view;
        }

        function toggleView( view )
        {
            deselect();
            if( open === view || view === 'hide' )
            {
                if( vscode.workspace.getConfiguration( 'activitusbar' ).get( 'toggleSidebar' ) )
                {
                    if( view === 'search' && vscode.workspace.getConfiguration( 'activitusbar' ).get( 'searchViewInPanel' ) === true )
                    {
                        vscode.commands.executeCommand( "workbench.action.togglePanel" );
                    }
                    else
                    {
                        vscode.commands.executeCommand( "workbench.action.toggleSidebarVisibility" );
                    }
                }
                else
                {
                    if( buttons[ view ] )
                    {
                        buttons[ view ].color = activeColour();
                    }
                }
                if( open === 'hide' )
                {
                    if( buttons[ view ] )
                    {
                        buttons[ view ].color = activeColour();
                    }
                }
                else
                {
                    open = 'hide';
                }
            }
            else
            {
                showView( view );
            }
        }

        function showSearchViewWithSelection()
        {
            showView( 'search' );
            vscode.commands.executeCommand( "workbench.action.findInFilesWithSelectedText" );
        }

        function showReplaceViewWithSelection()
        {
            showView( 'search' );
            vscode.commands.executeCommand( "workbench.action.replaceInFiles" );
        }

        function makeShowView( view )
        {
            return function()
            {
                showView( view );
            };
        }

        function makeToggleView( view )
        {
            return function()
            {
                toggleView( view );
            };
        }

        function addButton( label, command, viewName, tooltip )
        {
            var alignment = vscode.StatusBarAlignment[ vscode.workspace.getConfiguration( 'activitusbar' ).get( 'alignment', "Left" ) ];
            var button = vscode.window.createStatusBarItem( alignment, priority-- );
            button.text = '$(' + label + ')';
            button.command = command;
            button.tooltip = tooltip ? tooltip : tooltips[ viewName ];
            button.color = inactiveColour();
            if( open === viewName )
            {
                button.color = activeColour();
            }
            button.show();

            return button;
        }

        function addTaskButton( label, command, taskName, tooltip )
        {
            var alignment = vscode.StatusBarAlignment[ vscode.workspace.getConfiguration( 'activitusbar' ).get( 'alignment', "Left" ) ];
            var button = vscode.window.createStatusBarItem( alignment, priority-- );
            button.text = '$(' + label + ')';
            button.command = command;
            button.color = inactiveColour();
            button.tooltip = tooltip ? tooltip : "Run task " + taskName;
            button.show();
            return button;
        }

        function addSettingsButton( label )
        {
            var alignment = vscode.StatusBarAlignment[ vscode.workspace.getConfiguration( 'activitusbar' ).get( 'alignment', "Left" ) ];
            var button = vscode.window.createStatusBarItem( alignment, priority-- );
            button.text = '$(' + label + ')';
            button.command = "workbench.action.openSettings";
            button.color = inactiveColour();
            button.tooltip = "Open settings";
            button.show();
            return button;
        }

        function createButtons()
        {
            Object.keys( buttons ).forEach( button => buttons[ button ].dispose() );
            buttons = [];
            commands.forEach( command => command.dispose() );
            commands = [];

            var definedViews = vscode.workspace.getConfiguration( 'activitusbar' ).views;
            startingPriority = vscode.workspace.getConfiguration( 'activitusbar' ).get( 'priority', '99999' );;

            priority = startingPriority;

            definedViews.forEach( function( view )
            {
                var command;
                if( view.name.indexOf( "task." ) === 0 )
                {
                    var taskName = view.name.substr( 5 );
                    var dotPosition = taskName.indexOf( '.' );
                    var workspace;
                    if( dotPosition > -1 )
                    {
                        workspace = taskName.substr( 0, dotPosition );
                        taskName = taskName.substr( dotPosition + 1 );
                    }

                    vscode.tasks.fetchTasks().then( function( availableTasks )
                    {
                        var found = false;
                        availableTasks.map( function( task )
                        {
                            if( task.name === taskName && ( workspace === undefined || task.scope.name === workspace ) )
                            {
                                found = true;
                                command = 'activitusbar.startTask' + taskName;
                                buttons[ view.name ] = addTaskButton( view.octicon, command, taskName, view.tooltip );
                                commands.push( vscode.commands.registerCommand( command, function()
                                {
                                    vscode.tasks.executeTask( task );
                                } ) );
                            }
                        } );
                        if( found === false )
                        {
                            vscode.window.showErrorMessage( "Failed to create button for task '" + taskName + "'" );
                        }
                    } );
                }
                else if( view.name.toLowerCase() === "settings" )
                {
                    buttons[ view.name ] = addSettingsButton( view.octicon );
                }
                else
                {
                    var commandKey = view.name.capitalize() + 'View'
                    command = 'activitusbar.toggle' + commandKey;
                    viewNames.push( view.name );
                    buttons[ view.name ] = addButton( view.octicon, command, view.name, view.tooltip );
                    commands.push( vscode.commands.registerCommand( command, makeToggleView( view.name ) ) );

                    if( view.name !== 'search' )
                    {
                        commands.push( vscode.commands.registerCommand( 'activitusbar.show' + commandKey, makeShowView( view.name ) ) );
                    }
                }
            } );
        }

        context.subscriptions.push(
            vscode.commands.registerCommand( 'activitusbar.showSearchViewWithSelection', showSearchViewWithSelection ),
            vscode.commands.registerCommand( 'activitusbar.showReplaceViewWithSelection', showReplaceViewWithSelection ) );

        context.subscriptions.push( vscode.workspace.onDidChangeConfiguration( function( e )
        {
            if( e.affectsConfiguration( "activitusbar" ) )
            {
                createButtons();
            }
        } ) );

        createButtons();
    }

    function updateDeprecatedConfiguration()
    {
        function migrate( oldConfig )
        {
            var newConfig = [];

            Object.keys( oldConfig ).map( v =>
            {
                newConfig.push( { name: v, octicon: oldConfig[ v ] } );
            } );

            return newConfig;
        }

        var config = vscode.workspace.getConfiguration( 'activitusbar' );
        var viewConfig = config.views;

        var details = config.inspect( 'views' );

        if( typeof ( viewConfig ) === "string" )
        {
            var originalConfig = viewConfig;

            viewConfig = {
                "explorer": "file-text",
                "search": "search",
                "scm": "repo-forked",
                "debug": "bug",
                "extensions": "package"
            };

            Object.keys( viewConfig ).map( v =>
            {
                if( originalConfig.indexOf( v ) === -1 )
                {
                    viewConfig[ v ] = "";
                }
            } );

            config.update( 'views', viewConfig, true ).then( build );
        }
        else if( details.globalValue && details.globalValue.constructor !== Array )
        {
            config.update( 'views', migrate( details.globalValue ), vscode.ConfigurationTarget.Global ).then( build );
        }
        else if( details.workspaceValue && details.workspaceValue.constructor !== Array )
        {
            config.update( 'views', migrate( details.workspaceValue ), vscode.ConfigurationTarget.Workspace ).then( build );
        }
        else if( details.workspaceFolderValue && details.workspaceFolderValue.constructor !== Array )
        {
            config.update( 'views', migrate( details.workspaceFolderValue ), vscode.ConfigurationTarget.WorkspaceFolder ).then( build );
        }
        else
        {
            build();
        }
    }

    updateDeprecatedConfiguration();
}

function deactivate()
{
}

exports.activate = activate;
exports.deactivate = deactivate;

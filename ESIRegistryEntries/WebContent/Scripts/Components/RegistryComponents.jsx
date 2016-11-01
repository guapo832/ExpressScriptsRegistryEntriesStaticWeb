var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/* Styles used in React */
var collapsePanelLink={
    cursor:'pointer'
}

var filterPanelStyle = {
        padding:'10px',
}

var modalStyle = {
          position: 'fixed',
          fontFamily: 'Arial, Helvetica, sans-serif',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 99999,
          transition: 'opacity 1s ease-in',
          pointerEvents: 'auto',
          overflowY: 'auto'
        }

        var containerStyle = {
          width: '45%',
          height:'auto',
          position: 'relative',
          margin: '10% auto',
          padding: '0px 0px 0px 0px',
          
        }

      



      var inlineStyle={
            display:"inline"
        }


function convertData(indata){
    var scopeArray=[];
    var scopeAssoc={};
    var idx=0;
    for(var i=0;i<indata.length;i++){
        if(typeof(scopeAssoc[indata[i].scope]) == 'undefined'){
            scopeAssoc[indata[i].scope] = idx;
            scopeArray.push({scope:indata[i].scope,regentries:[indata[i]]});
            idx++;
        }else{
            scopeArray[scopeAssoc[indata[i].scope]].regentries.push(indata[i]);
        }
    }
    return {ScopeArray:scopeArray,ScopeAssoc:scopeAssoc};
}
/* end styles used in react */

var WorkingDialog=React.createClass({
   render:function(){
       return <div className="panel panel-default"><div className="panel panel-heading"><i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only"></span></div><div className="panel panel-body"> Working...</div></div>
   } 
});

/*Modal is used to do popup forms and dialogs */
var Modal = React.createClass({
    render: function() {
    if(this.props.isOpen){
        return (<ReactCSSTransitionGroup 
            transitionName='modal'
            transitionEnterTimeout={1000}
            transitionLeaveTimeout={1000}
            transitionAppear={true} >
                    <div>
                        <div style={modalStyle}>
                            <div style={containerStyle}>
                                {this.props.children}
                            </div>
                        </div> 
                    </div>
                </ReactCSSTransitionGroup>
                
       );
    } else {
        return null;
    }
        
    }
});



var ErrorMessage = React.createClass({
    render:function(){
        return <div className="alert alert-danger fade in" id="searchResultsError">{this.props.children}</div>
    }
})

/* Main application for categorized view */
var RegistryApplication = React.createClass({
    getInitialState: function() { 
         return {
             isModalOpen: false,
             data:convertData([]),
             filterData:{scope:'*',name:'*',value:'*',confidential:'*',sensitive:false,inheritance:false,count:100,offset:0},
            resultCount:0,
             error:''
          }; 
         
     }, 
     
     
     
     componentDidMount: function(){
       
        this.getData(this.state.filterData);
     },
    
     
     //get data retrieves registry entries from server
     getData:function(filterData){
        /* this.setState({ isModalOpen: true,
             ModalData:<WorkingDialog/>
           });
         */
         
         searchurl = this.props.url + "/registryEntry?scope=" + encodeURIComponent(filterData.scope) + "&confidential=" + filterData.confidential + "&name=" + encodeURIComponent(filterData.name) + "&value=" + encodeURIComponent(filterData.value) + "&useInheritance=" + filterData.inheritance + "&matchCase=" + filterData.sensitive + "&offset=" + filterData.offset + "&count=" + filterData.count;
         $.ajax({
          url: searchurl,
          dataType: 'json',
          cache: false,
          success: function(data) {
              
              this.setState({data:convertData([]),isModalOpen:false})
              var dataMessage = data.list.length==0?<ErrorMessage>No Results Found</ErrorMessage>:''; 
              var newData = convertData(data.list);
              this.setState({data:newData,filterData:filterData,error:dataMessage,resultCount:data.totalCount,isModalOpen:false});
          }.bind(this),
          error: function(xhr, status, err) {
              var dataMessage = <ErrorMessage>{err.toString()}</ErrorMessage>
          this.setState({error:dataMessage});
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });


     },
     
      
      
      openCreateForm: function(e) {
          e.preventDefault();
          data = {scope:'',name:'',value:'',confidential:''};
          this.setState({ isModalOpen: true,
          ModalData:<div className="panel panel-default">
              <div className="panel panel-heading"><h3>Create Entry</h3></div>
              <div className="panel panel-body"><RegistryEntryForm onSubmit={this.addEntry} type="POST" url={this.props.url} onCancel={this.closeModal} data={data}/></div>
              <div className="panel panel-footer">&nbsp;</div>
          </div>
              
             
        });
          
     },
     
     
   
     closeModal: function() { 
         this.setState({ isModalOpen: false }); 
     }, 
     
     copyScope: function(data,newScope){
         
         var newData = this.state.data;
         newData.ScopeArray.push({scope:newScope,regentries:data});
        newData.ScopeAssoc[newScope] = newData.ScopeArray.length-1;
       this.setState({data:newData,resultCount:this.state.resultCount + newData.ScopeArray.length})
     },
     
         
     deleteScope:function(scope){
         var newData = this.state.data; 
         var deleteArr = [];
         
         searchurl = this.props.url + "/registryEntry?scope=" + encodeURIComponent(scope) ;
         
         $.ajax({
          url: searchurl,
          dataType: 'json',
          cache: false,
          success: function(data) {
            for(i = 0; i< data.list.length; i++){
                deleteArr.push(data.list[i].id);
             }
            $.ajax({
                  url: this.props.url + "/registryEntry/" + deleteArr.join(),
                  type:'DELETE',
                  cache: false,
                  success: function(data) {
                     this.getData(this.state.filterData);
                  }.bind(this),
                  error: function(xhr, status, err) {
                      alert(err.toString() + status);
                      
                    console.error(this.props.url, status, err.toString());
                  }.bind(this)
                });
         
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
         
     },
     
     searchEntries:function(searchData){
         searchData.offset = this.state.filterData.offset;
        this.getData(searchData); 
     },
     
     updateEntry:function(entryData){
         
        var newData = this.state.data;
        var regentries =  newData.ScopeArray[newData.ScopeAssoc[entryData.scope]].regentries
        for(var i = 0; i<regentries.length; i++){
            if(regentries[i].id == entryData.id){
                regentries[i] = entryData;
                 break;
            }
        }
        this.setState({data: newData,error:''});
         this.closeModal();
     },
     
     addEntry:function(data){
         var newData = this.state.data;
         if(typeof(newData.ScopeAssoc[data.scope]) == 'undefined'){
             newData.ScopeArray.push({scope:data.scope,regentries:[]});
             newData.ScopeAssoc[data.scope] = newData.ScopeArray.length-1;
         }
         newData.ScopeArray[newData.ScopeAssoc[data.scope]].regentries.push(data);
        this.setState({data: newData,resultCount:this.state.resultCount+1,error:''});
        this.closeModal();
        
         
      
     },
     
     deleteEntry:function(entryid){
             var data = this.state.data;
             var newdata = this.state.data;
             var found = false;
             for(var i = 0; i<data.ScopeArray.length; i++){
                for(var j = 0; j<data.ScopeArray[i].regentries.length ; j++){
                    if(data.ScopeArray[i].regentries[j].id == entryid) {
                        found = true;
                        var scope = newdata.ScopeArray[i].regentries[j].scope; //scope this entry lives under
                        newdata.ScopeArray[i].regentries.splice(j,1); //remove item from data
                        break;
                    }
                   if(found) break; 
                }
            
             }
             
             $.ajax({
              url: this.props.url + "/registryEntry/" + entryid,
              type:'DELETE',
              cache: false,
              success: function(data) {
                  this.setState(newdata);
              }.bind(this),
              error: function(xhr, status, err) {
                  alert(status);
                  alert(err.toString());
                console.error(this.props.url, status, err.toString());
              }.bind(this)
            });
         
         
     },
     
     getScopeEntries:function(scope){
         
         var newData = this.state.data;
         var  searchurl = this.props.url + "/registryEntry?scope=" + encodeURIComponent(scope) + "&confidential=*&name=*&value=*&matchCase=false";
        $.ajax({
         url: searchurl,
         dataType: 'json',
         cache: false,
         success: function(data) {
            
            var resultCount = this.state.resultCount;
            
            for(var i = 0; i< newData.ScopeArray[newData.ScopeAssoc[scope]].regentries.length; i++){
                newData.ScopeArray[newData.ScopeAssoc[scope]].regentries.splice(0,1);
                resultCount--;
            }
            
            for(var i = 0; i< data.list.length; i++){
                newData.ScopeArray[newData.ScopeAssoc[scope]].regentries.push(data.list[i]);
                resultCount++;
            }
            
            this.setState({data: newData,resultCount:this.state.resultCount+1}); 
            
            
         }.bind(this),
         error: function(xhr, status, err) {
             alert(err)
         }.bind(this)
       });
     },
     
     newPageHandler:function(newOffset){
         var filterData = this.state.filterData;
         filterData.offset = newOffset;
         this.setState({filterData:filterData,resultCount:this.state.resultCount-1});
         this.getData(filterData);
     },
    render: function() {
       
        return <div>
                <a href="#" onClick={this.openCreateForm}><span className="glyphicon glyphicon-plus-sign" title="Add Entry"></span></a> 
                <Modal isOpen={this.state.isModalOpen}>{this.state.ModalData}</Modal> 
                <RegistryEntryFilterPanel>
                   <FilterForm data={this.state.filterData} onSubmit={this.searchEntries}/></RegistryEntryFilterPanel >
                   <ResultCount data={this.state.resultCount}/>
                 {this.state.error}
                   <RegistryScopeList url={this.props.url} getScopeEntries={this.getScopeEntries} deleteEntryHandler={this.deleteEntry} addEntryHandler={this.addEntry} updateEntryHandler={this.updateEntry} deleteScopeHandler={this.deleteScope} copyScopeHandler={this.copyScope} data={this.state.data}/>
                   <Pagination getNewPage={this.newPageHandler} resultCount={this.state.resultCount} offset={this.state.filterData.offset} numEntriesPerPage={this.state.filterData.count} />
            </div>
    }
    
    
});



var ResultCount = React.createClass({
    render: function(){
        return <div><h4>Entries Found: {this.props.data}</h4></div>
    }
});

var PaginationLink = React.createClass({
    handleNewPage:function(e){
        e.preventDefault();
      this.props.onClick(this.props.id)  
    },
        
    render: function(){
        return(<li className={this.props.className}><a href="#" onClick={this.handleNewPage}>{this.props.id}</a></li>);
    }
});

var Pagination = React.createClass({
   handleNewPage:function(id){
       var newoffset = this.props.numEntriesPerPage * (id-1);
       this.props.getNewPage(newoffset);
   },
   Pages:[],
   
   render:function(){
       this.Pages = [];
       
       var numPages = Math.ceil(this.props.resultCount/this.props.numEntriesPerPage);
       var curPage = Math.floor(this.props.offset/this.props.numEntriesPerPage) + 1
       
       for(i = 1  ; i <= numPages; i++){
           if(i==curPage) this.Pages.push({id:i,classname:"active"});
           else this.Pages.push({id:i,classname:""});
           
       }
       
       var pageLinks = this.Pages.map(function(page,key) {
           return (<PaginationLink onClick={this.handleNewPage} key={key} id={page.id} className={page.classname} />);
          },this);
       
       return(<ul className="pagination">{pageLinks}</ul>);
   } 
});

/* component that displays a categorized list of  Registry scopes*/
var RegistryScopeList = React.createClass({
    
    handleCopyScope: function(obj, entryData, oldscope){
        
        this.props.copyScopeHandler(entryData, oldscope)
    },
    handleDeleteScope: function(obj,scope){
        this.props.deleteScopeHandler(scope);
    },
    handleDeleteEntry: function(obj,entryId){
        this.props.deleteEntryHandler(entryId);
    },
    
    handleUpdateEntry: function(obj,entryData){
        this.props.updateEntryHandler(entryData);
    },
    
    handleAddEntry: function(obj,entryData){
       this.props.addEntryHandler(entryData);
    },
    
    handleUpdateScope:function(obj,scope){
       this.props.getScopeEntries(scope);
    },
    
    render: function(){
        return(<div className="panel-group" id="accordion">
        {this.props.data.ScopeArray.map(function(scopes,idx) {
              var boundCopyScope = this.handleCopyScope.bind(null,this);    
              var boundUpdateEntry = this.handleUpdateEntry.bind(null,this);
              var boundDeleteScope = this.handleDeleteScope.bind(null,this.scopes);
              var boundDeleteEntry = this.handleDeleteEntry.bind(null,this);
              var boundAddEntry = this.handleAddEntry.bind(null,this);
              var boundUpdateScope = this.handleUpdateScope.bind(null,this);
              return (
                          <RegistryScope handleDeleteEntry={boundDeleteEntry}
                            handleUpdateEntry={boundUpdateEntry}
                            handleAddEntry = {boundAddEntry}
                            handleDeleteScope={boundDeleteScope}
                            updateScope={boundUpdateScope}
                            data={scopes.regentries}
                            key={idx}
                            url={this.props.url}
                            idx={"scope" +idx}
                            scope={scopes.scope}
                            handleCopyScope={boundCopyScope}
                            />
                      );
             },this)}
        </div>
        
            
        );
    }
});

var RegistryScope = React.createClass({
    getInitialState: function() { 
        return { isModalOpen: false,
               ModalData:null,
               showAllLink:'',
               data:this.props.data
         }; 
        
    }, 

    openModal: function() { 
        this.setState({ isModalOpen: true }); 
    }, 
    closeModal: function() { 
        this.setState({ isModalOpen: false }); 
    },

    openCreateEntry: function(e){
        e.preventDefault();
        var data={scope:this.props.scope,name:'',value:'',confidential:false};
       this.setState({ isModalOpen: true,
       ModalData:<div className="panel panel-default"><div className="panel panel-heading"><h3>CreateEntry</h3> </div>
              <div className="panel panel-body"><RegistryEntryForm onSubmit={this.createEntryHandler} type="POST" url={this.props.url} onCancel={this.closeModal} data={data}/></div><div className="panel panel-footer"></div></div>
       });
       
    },
    
    createEntryHandler:function(entryData){
      this.closeModal();
      this.props.handleAddEntry(entryData);
      
    },
    
    onHandleCopyScopeSubmit:function(data,newScope){
        this.closeModal();
        this.props.handleCopyScope(data,newScope);
       //TODO add copy functionality;
       
    },
    
    onHandleDeleteScope:function(){
        this.closeModal();
        this.props.handleDeleteScope(this.props.scope)
    },
    
    onHandleDeleteEntry:function(entryId){
        this.props.handleDeleteEntry(entryId)
    },
    
    onHandleUpdateEntry:function(entryData){
        this.props.handleUpdateEntry(entryData);  
    },
    
    confirmDeleteScope:function(e){
        e.preventDefault();
        
        
        this.setState({ isModalOpen: true,
           ModalData:<div><ConfirmationForm onCancel={this.closeModal} onSubmit={this.onHandleDeleteScope} header={<h3>Confirm Delete Scope</h3>}>
          
          <p>Are you sure you want to delete this scope {this.props.idx}</p>
         
           </ConfirmationForm></div>});
    
    },
    
    openCopyScope: function(e){
       e.preventDefault();
       
       this.setState({ isModalOpen: true,
       ModalData:<div className="panel panel-default">
          <div className="panel panel-heading"><h3>Copy Scope</h3></div>
          <div className="panel panel-body"><CopyScopeForm onCancel={this.closeModal} url={this.props.url} scope={this.props.scope} onSubmit={this.onHandleCopyScopeSubmit}/></div>
          <div className="panel panel-footer"></div>
          </div>  
              
       });
       
    },
    
    onShowAllClick:function(e){
        e.preventDefault(); 
        this.props.updateScope(this.props.scope);
        this.setState({showAllLink:''});
    },
    setShowAllLink:function(e){
        e.preventDefault();
        var  searchurl = this.props.url + "/registryEntry?scope=" + encodeURIComponent($(e.target).text()) + "&confidential=*&name=*&value=*&matchCase=false";
       
        $.ajax({
         url: searchurl,
         dataType: 'json',
         cache: false,
         success: function(data) {
             
         if(this.state.data.length < data.totalCount)
                 {
                  this.setState({showAllLink:<a href="#" className="pull-right" onClick={this.onShowAllClick}>Show All</a>});
                 }
            
             
         }.bind(this),
         error: function(xhr, status, err) {
             alert(err)
         }.bind(this)
       });
       
    },
    
    
    
   render: function(){
       
       var id = this.props.idx.replace(/[\/\s]/g,'_'); //id will be used in bootstrap panels, so that each panel has a unique id.
       var datatarget= "#" + id;
       
       
       
       return (<div className="panel panel-primary" >
        <Modal isOpen={this.state.isModalOpen} transitionName="modal-anim"> 
             {this.state.ModalData} 
       </Modal> 
       <div className="panel-heading">
       <h4 className="panel-title">
         <span style={collapsePanelLink} data-toggle="collapse" data-parent="#accordion" data-target={datatarget} onClick={this.setShowAllLink}>{this.props.scope}</span>
         <span className="panel-title pull-right">
             <a href="#" onClick={this.openCopyScope}>
                 <span title="Copy Scope" className="glyphicon glyphicon-share"></span>
             </a>
             <a href="#" onClick={this.confirmDeleteScope}>
                 <span title="delete scope" className="glyphicon glyphicon-remove"></span>
              </a>
         </span>
       </h4>
     </div>
     <div id={id} className="panel-collapse collapse">
       <div className="panel-body">
       <a href="#" onClick={this.openCreateEntry}>
           <span title="Create Entry in this scope" className="glyphicon glyphicon-plus"></span>
       </a> 
       {this.state.showAllLink}
       <RegistryEntryList id={id} deleteEntryHandler={this.onHandleDeleteEntry} url={this.props.url} updateEntryHandler={this.onHandleUpdateEntry} data={this.state.data}/>
       
       </div>
       </div></div>);
     
 
   }
});

/*
 * This will be an iteration of all registry entries in a collection
 */
var RegistryEntryList = React.createClass({
    getInitialState: function() { 
        return { data:[]}; 
        
    },   
    
    
    
    componentDidMount:function(nextprops){
        this.setState({data:this.props.data});  
     },

    handleDeleteEntry: function(obj,entryId){
        this.props.deleteEntryHandler(entryId);
    },
    handleUpdateEntry: function(obj,entryData){
        this.props.updateEntryHandler(entryData);
    },
    render: function(){
         var parent="accordion" + this.props.id;    
      
        var items = this.state.data.map(function(entry) {
              var boundDeleteEntry = this.handleDeleteEntry.bind(null,this.entry);
              var boundUpdateEntry = this.handleUpdateEntry.bind(null,this.entry)
              return (
                      <RegistryEntry key={entry.id} data={entry} url={this.props.url} idx={parent} handleUpdateEntry={boundUpdateEntry} handleDeleteEntry={boundDeleteEntry}/>
                      );
             },this);
        return(
        
        
        <div className="panel-group" id={parent}>
        {items}
        </div>
        
      );
    }   
    
});


/*
 * This represents the registry entry object
 */
var RegistryEntry = React.createClass({
    
    getInitialState: function() { 
         return { isModalOpen: false,
                ModalData:null,
                data:{id:0,name:'',value:'',confidential:false,scope:''}
          }; 
         
     }, 
     
     
     componentDidMount:function(){
        this.setState({data:this.props.data});  
     },
     openModal: function() { 
         this.setState({ isModalOpen: true }); 
     }, 
     closeModal: function() { 
         this.setState({ isModalOpen: false }); 
     },
     
     onHandleDeleteEntry:function(){
         this.closeModal();
         this.props.handleDeleteEntry(this.props.data.id)
     },
     
     confirmDeleteEntry:function(e){
         e.preventDefault();
         this.setState({ isModalOpen: true,
            ModalData:<div><ConfirmationForm onCancel={this.closeModal} onSubmit={this.onHandleDeleteEntry} header={<h3>Confirm Delete Entry</h3>}>
                
          <p>Are you sure you want to delete this Entry {this.props.data.name}</p>
            </ConfirmationForm></div>});
     
     },
     
     updateEntryHandler: function(entryData){
         this.setState({data:entryData});
         this.props.handleUpdateEntry(entryData);
         this.closeModal();
         
     },
     
    openEditEntry: function(e){
        e.preventDefault();
        this.setState({ isModalOpen: true,
        ModalData:<div className="panel panel-default"><div className="panel panel-heading"><h3>Edit Registry Entry</h3></div>
        <div className="panel panel-body"><RegistryEntryForm onSubmit={this.updateEntryHandler} type="PUT" url={this.props.url} onCancel={this.closeModal} data={this.state.data}/></div>
        <div className="panel panel-footer"></div></div>
        });
        
     },
    
    render:function(){
        var id = this.props.data.id;
        var editid = this.props.data.id + "edit";
        var datatarget= "#" + id;
        var dataedittarget="#" + id + "edit";
        var dataparent="#" + this.props.idx;
        
        
        
        return <div className="panel panel-default">
                    <Modal isOpen={this.state.isModalOpen}> 
                        {this.state.ModalData} 
                    </Modal> 
                    <div className="panel-heading">
                        <h4 className="panel-title">
                            <span style={collapsePanelLink}  data-toggle="collapse" data-parent={dataparent} data-target={datatarget}>{this.props.data.name}</span>
                            <a href="#" className="pull-right" onClick={this.openEditEntry}><span title="edit entry" className="glyphicon glyphicon-edit"></span></a>&nbsp;
                            <a href="#" className="pull-right" onClick={this.confirmDeleteEntry}><span title="delete entry" className="glyphicon glyphicon-remove"></span></a>
                        </h4>
                    </div>
                            
                            <RegistryEntryRead id={this.props.data.id} data={this.state.data} url={this.props.url}/>
                    
                </div>
    }
});


/* form to copy scope
 * all registry entries that have that scope will be copied into
 * the new scope.
 */
var CopyScopeForm = React.createClass({

    getInitialState: function(){
        return{scope:'',errormessage:'',disabledSubmit:true};
    },
   handleCancel: function(){
      this.props.onCancel();
   },
   
   handleScopeChange: function(e){
       
     this.setState({scope: e.target.value,errormessage:'',disabledSubmit:false},function(){
         if(this.state.scope !=''){
             var  searchurl = this.props.url + "/registryEntry?scope=" + encodeURIComponent(this.state.scope) + "&confidential=*&name=*&value=*&matchCase=false";
             $.ajax({
                 url: searchurl,
                 dataType: 'json',
                 cache: false,
                 success: function(data) {
                     if(data.totalCount>0) this.setState({errormessage:<ErrorMessage>A Scope with this name already exists</ErrorMessage>,disabledSubmit:true})
                 }.bind(this),
                 error: function(xhr, status, err) {
                     this.setState({errormessage:status + err.toString()});
                 }.bind(this)
             });
         }
     });
   },
   
   handleSubmit: function(e){
      //TODO do submit
      e.preventDefault();
      
      var scopeFilterUrl = this.props.url + "/registryEntry?scope=" + this.props.scope
      var scope=this.state.scope;
      var destScope = {scope:scope,regentries:[]};
      
      $.ajax({
          url: scopeFilterUrl,
          dataType: 'json',
          cache: false,
          success: function(data) {
             
              var scopeData = convertData(data.list);
              var entriestocopy = scopeData.ScopeArray[scopeData.ScopeAssoc[this.props.scope]].regentries;
             
             for(i=0;i<entriestocopy.length;i++){
                destScope.regentries.push({scope:scope, name:entriestocopy[i].name,id:0,value:entriestocopy[i].value});
            }
            var newList = {list:destScope.regentries,totalCount:destScope.regentries.length}
          
            $.ajax({
              url: this.props.url + "/registryEntry/batch",
              type: "POST",
              dataType: 'json',
              data:JSON.stringify(newList),
              processData:false,
              cache: false,
              contentType:'application/json',
              success: function(data) {
              this.props.onSubmit(data.list,scope)
              }.bind(this),
              error: function(xhr, status, err) {
                  alert("Error" + err.toString());
                  alert(JSON.stringify(xhr));
                console.error(this.props.url, status, err.toString());
              }.bind(this)
            });
          }.bind(this),
          error: function(xhr, status, err) {
              this.setState({errormessage:<ErrorMessage>{status + " " + err.toString()}</ErrorMessage>});
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
        
      
      
      
      
   },
   render: function(){
      return (<form>
      
    <div className="form-group row">
      <label for="txtScope" className="col-sm-2 col-form-label">Scope</label>
      <div className="col-sm-10">
        <input type="text" className="form-control" onChange={this.handleScopeChange} id="txtScope" placeholder="Scope"/>
      </div>
    </div>
          
    <div className="form-group row">
      <div className="offset-sm-2 col-sm-10">
        <button type="submit" className="btn btn-primary" onClick={this.handleSubmit} disabled={this.state.disabledSubmit}>Submit</button>
        <button type="button" className="btn btn-primary" onClick={this.handleCancel}>Cancel</button>
      </div>
    </div>
    <span>{this.state.errormessage}</span>
  </form>);
   }
});

/*
 * This form is used for create/edit of a registry entry.
 */
var RegistryEntryForm = React.createClass({
    getInitialState: function(){
        return {name:'',value:'',scope:'',confidential:'', id:0,};
    },
    
    componentDidMount: function(){
        
         this.setState({id:this.props.data.id,
             name:this.props.data.name,
             scope:this.props.data.scope,
             confidential:this.props.data.confidential,
             value:this.props.data.value});
    },
    
    onSubmitClicked:function(e){
        e.preventDefault();
        var name=this.state.name;
        var scope=this.state.scope;
        var confidential= this.state.confidential!=null?this.state.confidential:false;
        var value = this.state.value
        var id = typeof(this.props.data.id) != 'undefined'?this.props.data.id:0;
        var entryData = {id:id, name:name,value:value,scope:scope,confidential:confidential};
        
        var murl = this.props.url + "/registryEntry";
         var murl = id===0?murl:murl + "/" + id;
         $.ajax({
             url: murl,
             dataType: 'json',
             type:this.props.type,
             processData: false,
             contentType:'application/json',
             data: JSON.stringify(entryData),
             cache: false,
             success: function(data) {
                 this.props.onSubmit(data);
             }.bind(this),
             error: function(xhr, status, err) {
                 this.setState(err)
                 alert(status);
                 console.error(murl, status, err.toString());
             }.bind(this)
           });
        
        
        
    },
    
    
    onNameChange:function(e){
        this.setState({name: e.target.value});
    },
    
    onScopeChange:function(e){
       this.setState({scope: e.target.value});
    },
    
    onValueChange:function(e){
       this.setState({value: e.target.value});
    },
    
    onConfidentialChange:function(e){
       this.setState({confidential: e.target.checked});
    },
    
    
    
    render:function(){
        return (<form>
         <div class="form-group">
            <label for="scope">Scope</label>
            <input type="text" className="form-control" onChange={this.onScopeChange} id="scope" value={this.state.scope} />
          </div>
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" onChange={this.onNameChange} className="form-control" id="name" value={this.state.name} />
          </div>
          <div class="form-group">
            <label for="value">Value:</label>
            <input type="text" onChange={this.onValueChange} className="form-control" id="value" value={this.state.value} />
          </div>
          <hr />
          <div className="form-group">
           <div className="checkbox">
            <label><input type="checkbox" id="confidential" onChange={this.onConfidentialChange} checked={this.state.confidential}  /> Is Confidential</label>
          </div>
                    
          
          </div>
          
          <div className="form-group row">
            <div className="offset-sm-2 col-sm-10">
              <button type="button" className="btn btn-primary pull-right" onClick={this.onSubmitClicked} >Submit</button>
              <button type="button" className="btn btn-primary pull-right" onClick={this.props.onCancel} >Cancel</button>
            </div>
          </div>
          </form>);
          
          
    }
});


/*
 * Filter Form is used to do queries against data to filter results
 */
var FilterForm = React.createClass({
    getInitialState: function(){
        return {name:'*',value:'*',scope:'*',confidential:'*',inheritance:false,sensitive:false,count:100,valid:true,errormessage:''};
    },
    
    componentDidMount:function(){
      this.setState({count:this.props.data.count});  
    },
    onSubmitClicked:function(e){
       this.setState({errormessage:this.state.name})
        var name=this.state.name;
        var scope=this.state.scope;
        var confidential= this.state.confidential;
        var inheritance = this.state.inheritance;
        var sensitive = this.state.sensitive;
        var value = this.state.value;
        var count = this.state.count;
        
        this.props.onSubmit({name:name,value:value,scope:scope,confidential:confidential,inheritance:false,sensitive:false,count:count });
    },
    
    
    onNameChange:function(e){
        var valid=true
        this.setState({name: e.target.value,valid:valid},function(){this.onSubmitClicked(e)});
       
    },
    
    onScopeChange:function(e){
        this.setState({scope: e.target.value},function(){this.onSubmitClicked(e)});
    },
    
    onValueChange:function(e){
        this.setState({value: e.target.value},function(){this.onSubmitClicked(e)});
       
    },
    
    onConfidentialChange:function(e){
        this.setState({confidential: e.target.checked},function(){this.onSubmitClicked(e)});
        
    },
    
    onSensitiveChange:function(e){
        this.setState({sensitive: e.target.checked},function(){this.onSubmitClicked(e)});
        
    },
    
    onInheritanceChange:function(e){
        this.setState({inheritance: e.target.checked},function(){this.onSubmitClicked(e)});
       
    },
    
    onCountChange:function(e){
        this.setState({count:e.target.value},function(){this.onSubmitClicked(e)});
       
    },
    
    render:function(){
        return (<form>
        <span>{this.state.errormessage}</span>
          <h3>Filter Registry Entries</h3>
          <div class="form-group">
            <label for="scope">Scope</label>
            <input type="text" placeholder="Scope" className="form-control" value={this.state.scope} onChange={this.onScopeChange.bind(this)} id="scope" required />
          </div>
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" placeholder="Name" onChange={this.onNameChange} value={this.state.name} className="form-control" id="name" />
          </div>
          <div class="form-group">
            <label for="value">Value:</label>
            <input type="text" placeholder="Value" onChange={this.onValueChange} value={this.state.value} className="form-control" id="value" />
          </div>
            
          <div class="form-group">
            <label for="name">Max Results Per Page:</label>
            <input type="number" value={this.state.count} onChange={this.onCountChange} className="form-control" max="500" min="0" id="name" />
          </div>
            
          <hr />
          <div className="form-group">
           <div className="checkbox">
            <label><input type="checkbox" id="confidential" onChange={this.onConfidentialChange} checked={this.state.confidential}  /> Is Confidential</label>
          </div>
                    
          <div className="checkbox">
            <label><input type="checkbox" id="inheritance" onChange={this.onInheritanceChange} checked={this.state.inheritance} /> Use inheritance</label>
          </div>
          
          <div className="checkbox">
            <label><input type = "checkbox" id = "sensitive" onChange={this.onSensitiveChange} checked={this.state.sensitive} /> Case Sensitive</label>
          </div>
          </div>
          
          <div className="form-group row">
            <div className="offset-sm-2 col-sm-10">
              <button type="submit" className="btn btn-primary pull-right" enabled={this.state.valid} onClick={this.onSubmitClicked} >Submit</button>
            </div>
          </div>
          </form>);
          
          
    }
});


/*
 * this dialogue is to confirm deleting entries etc.
 */
var ConfirmationForm = React.createClass({
    render:function(){
        return (
                <div className="panel panel-default">
         <div className="panel panel-heading">
            {this.props.header}
         </div>
        <div className="panel panel-body">
          {this.props.children}
          <button type="button" onClick={this.props.onSubmit} className="btn btn-primary pull-right">Submit</button>
          <button type="button" onClick={this.props.onCancel} className="btn btn-primary pull-right">Cancel</button>
          </div>
        <div className="panel panel-footer">
       {this.props.footer}
        </div>
         
        </div>
        );
    }
});



var PanelHeader=React.createClass({
    render:function(){
        return <div className="panel panel-heading">{this.props.children}</div>
    }
});

var PanelFooter=React.createClass({
    render:function(){
        return <div className="panel panel-footer">{this.props.children}</div>
    }
});



/*
 * This will hold a list of all registry entries that
 * are part of the same scope. A category by scope
 */




/*
 * this is the readonly view of a registry entry
 */
var RegistryEntryRead = React.createClass({
    
  render: function() {
      
      
    return  <div id={this.props.id} className="panel-collapse collapse">
                <div className="panel-body">
                    <RegistryEntryDispForm data={this.props.data} />
                </div>
            </div>
  

  }
});

/*
 * this is the display view of a registry entry
 */
var RegistryEntryDispForm= React.createClass({
    
  render: function() {
    var confidential= this.props.data.confidential?"checked":"";  
    return <div class="form-horizontal">
    <div class="form-group">
    <label class="control-label col-sm-2">ID:</label>&nbsp;{this.props.data.id}
     </div>
  <div class="form-group">
    <label class="control-label col-sm-2">Name:</label>{this.props.data.name}
    
  </div>
  
  <div class="form-group">
  <label class="control-label col-sm-2">Value:</label> {this.props.data.value}
  
</div>

<div class="form-group">
<label class="control-label col-sm-2">Confidential:</label>&nbsp;<input type="checkbox" checked={confidential} disabled="disabled"/>
</div>
</div>

    
   

  }
});


/*
 * This represents the container that holds the filter form. 
 * it is a collapsable panel that opens up using a button in the top left
 */
var RegistryEntryFilterPanel = React.createClass({
    render: function(){
        return <div><nav id="myNavmenu" style={filterPanelStyle} className="navmenu navmenu-default navmenu-fixed-left offcanvas" role="navigation">
         
         {this.props.children}
        
        </nav>
        <div className="navbar navbar-default navbar-fixed-top">
        <button type="button" className="navbar-toggle" data-toggle="offcanvas" data-target="#myNavmenu" data-canvas="body">
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        </button>
        </div>
        
        
        
        
        </div>
    }
});



  


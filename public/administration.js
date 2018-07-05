function myFunction(){
	axios.get('/suggestions?issue_number=41&volume_name=Flash&year=2018')
  .then(function (response) {
  	debugger;
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
}
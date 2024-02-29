const updateBtns = document.querySelectorAll('#update-btn');
const deleteBtns = document.querySelectorAll('#delete-btn');
const cancelBtns = document.querySelectorAll('#cancel-btn');
const saveBtns = document.querySelectorAll('#save-btn');

updateBtns.forEach(updateBtn => {
  updateBtn.addEventListener('click', _ => {
    // get the id from url parameter
    const taskId = updateBtn.dataset.id;
    console.log('clicked UPDATE btn', taskId);
    window.location.href =`/tasks/${taskId}/edit`;
  });
})

function getEditFormData() {
  const form = document.getElementById('editTaskForm');
  const taskFormData = {}
  const editForm = new FormData(form);
  console.log('ef',editForm)
  for(const [key, val] of editForm.entries()) {
    taskFormData[key] = val;
  }
  console.log(taskFormData)
  return taskFormData;
}
// handle when a user clicks "Save Changes" on the Edit Quote page
saveBtns.forEach(saveBtn => {
  saveBtn.addEventListener("click", _=> {
    const taskId = saveBtn.dataset.id;
    const taskUpdatedData = getEditFormData();
    // send PUT request to server with updated information
    fetch(`/tasks/${taskId}`,{
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskUpdatedData)
      }).then(_=> {
        alert('Your changes have been saved!')
      })
      .catch(err => console.error(err))
  })

})

// saveBtns.forEach(saveBtn => {
//   saveBtn.addEventListener('click', _ => {
//     const taskId = saveBtn.dataset.id;
//     // const taskUpdatedData = getEditFormData();
//     console.log('id', taskId, taskUpdatedData)

//     fetch(`/tasks/${taskId}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ taskUpdatedData })
//     }).then(_=> {
      //   alert('Your changes have been saved!')
      // })
      // .catch(err => console.error(err))

//   });
// });

// 


cancelBtns.forEach(cancelBtn => {
  cancelBtn.addEventListener('click', _ => {

  });
});

deleteBtns.forEach(deleteBtn => {
  deleteBtn.addEventListener('click', _ => {
    const taskId = deleteBtn.dataset.id;
    // const taskDeleteData = getEditFormData();
    console.log(taskId)
    fetch(`/tasks/${taskId}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify(taskDeleteData)
    })
      .then(res => {
        if (res.ok) {
          console.log(res)
          return res.json()
        }
      })
      .then(data => {
        console.log('Deleted:', data)
        alert('Your changes have been saved!')
      })
      .catch(err => {
        console.error(err);
        alert('An error occurred while deleting the task. Please try again later.'); 
      })
  });
});
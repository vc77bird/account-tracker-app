import React, {useState, useEffect, useCallback} from 'react'
import api from './api'

const App = () => {
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [formDatas, setFormDatas] = useState([]);
  const [newFormData, setNewFormData] = useState({
    username: '',
    email: '',
    existing_user: false,
    date_requested: '',
    date_au_created: '',
    date_training_assigned: '',
    date_account_created: '',
    date_account_activated: '',
    date_account_inactivated: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'asc',
  });
  const [blankDateFilter, setBlankDateFilter] = useState('');

  const fetchAccounts = useCallback(async () => {
    const response = await api.get(`/accounts/${sortConfig.key} ${sortConfig.direction}?filter=${blankDateFilter}`);
    setAccounts(response.data);
    setFormDatas(response.data.map(account => ({ ...account })));
  }, [sortConfig, blankDateFilter]);
  
    useEffect(() => {
      fetchAccounts();
    }, [sortConfig, blankDateFilter]);

  // Generate string 'mm/dd/yyy' of current date
  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so we add 1
    const year = today.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDeleteClick = (event, id) => {
    setSelectedAccountId(id);
  };

  const handleDeleteConfirm = async () => {
    if (selectedAccountId !== null) {
      await api.delete(`/account/${selectedAccountId}`);
      fetchAccounts();
      setSelectedAccountId(null); // Reset selected account after deletion
    }
  };

  const handleInputChange = (event, index) => {
    const { name, type, value } = event.target;

    event.target.value = name.startsWith("date_") && value.toLowerCase() === "t" ?
                          getFormattedDate() :
                          event.target.value;

    setFormDatas((prevFormDatas) => {
      const newFormDatas = [...prevFormDatas];
      newFormDatas[index] = {
        ...newFormDatas[index],
        // Replace checkbox True/False with Checked
        [name]: event.target[type === "checkbox" ? "checked" : "value"],
      };
    return newFormDatas;
    });
  };

  const handleFormSubmit = async (event, index) => {
    event.preventDefault();
    const id = formDatas[index].id;

    if (id) {
      await api.put(`/account/${id}/`, formDatas[index]);
    }

    fetchAccounts();
  };

  const handleNewFormInputChange = (event) => {
    const { name, type, value } = event.target;

    event.target.value = name.startsWith("date_") && value.toLowerCase() === "t" ?
                          getFormattedDate() :
                          event.target.value;

    setNewFormData((prevNewFormData) => ({
      ...prevNewFormData,
      // Replace checkbox True/False with Checked
      [name]: event.target[type === "checkbox" ? "checked" : "value"],
    }));
  };

  const handleNewFormSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post('/accounts/', newFormData);
    } catch (error) {
      console.log(error.response.data);
    }

    // Reset the new form data
    setNewFormData({
      username: '',
      email: '',
      existing_user: false,
      date_requested: '',
      date_au_created: '',
      date_training_assigned: '',
      date_account_created: '',
      date_account_activated: '',
      date_account_inactivated: '',
    });

    // Fetch updated accounts data
    fetchAccounts();
  };

  const handleSort = (event) => {
    const field = event.target.className.split(' ').find(classItem => classItem.startsWith('sort_')).replace('sort_', '')
    const direction = sortConfig.key === field ?
                      sortConfig.direction === 'asc' ?
                      'desc' : 'asc' : 'asc';
    setSortConfig({ key: field, direction });
  };
  
    const handleFilter = (event) => {
      const field = event.target.className.split(' ').find(classItem => classItem.startsWith('filter_')).replace('filter_', '')
      setBlankDateFilter(blankDateFilter === field ? '' : field);
    };

  // Function to get the arrow icon class based on sorting state
  const getArrowClass = (field) => {
    if (sortConfig.key === field) {
      return sortConfig.direction === 'asc' ? 'bi-arrow-down' : 'bi-arrow-up';
    }
    return 'bi-arrow-down-up';
  };

  return (
    <div className='container-fluid'>
      <nav className='navbar navbar-dark sticky-top bg-dark'>
        <div className='container-fluid text-info fw-bold'>
          {`E-Reg Account Tracker 
            | Total requests:   ${accounts.length} 
            | Wait Activation:  ${accounts
                                  .filter(x => x.date_account_created
                                    && !(x.date_account_activated))
                                  .length}
            | Active accounts:  ${accounts
                                  .filter(x => x.date_account_activated
                                    && !(x.date_account_inactivated))
                                  .length}`
            }
        </div>
        {/* Header */}
        <div className='container-fluid fw-bold text-primary-emphasis'>
          <label 
            className='col-2 text-center'>
              User Name
              <i
                className = {`bi ms-2 sort-button sort_username ${getArrowClass('username')}`}
                onClick   = {handleSort}>
              </i>
            </label>
          <label
            className = 'col-2 text-center'>
              Email
              <i
                className = {`bi ms-2 sort-button sort_email ${getArrowClass('email')}`}
                onClick   = {handleSort}>
              </i>
            </label>
          <label
            className = 'col-1 text-center'>
              Request
              <i
                className = {`bi ms-2 sort-button sort_date_requested ${getArrowClass('date_requested')}`}
                onClick   = {handleSort}>
              </i>
          </label>
          <label
            className = 'col-1 text-center'>
              AU Create
            <i
              className = {`bi ms-2 sort-button sort_date_au_created ${getArrowClass('date_au_created')}`}
              onClick   = {handleSort}>
              </i>
          </label>
          <label
            className = {`col-1 text-center filter-button filter_date_training_assigned ${blankDateFilter === 'date_training_assigned' ? 'filter-active' : ''}`}
            onClick={handleFilter}>
              AU Train
              <i
                className = {`bi ms-2 sort-button sort_date_training_assigned ${getArrowClass('date_training_assigned')}`}
                onClick   = {handleSort}>
              </i>
            </label>
          <label
            className = {`col-1 text-center filter-button filter_date_account_created ${blankDateFilter === 'date_account_created' ? 'filter-active' : ''}`}
            onClick={handleFilter}>
              Create
              <i
                className = {`bi ms-2 sort-button sort_date_account_created ${getArrowClass('date_account_created')}`}
                onClick   = {handleSort}>
              </i>
          </label>
          <label
            className = {`col-1 text-center filter-button filter_date_account_activated ${blankDateFilter === 'date_account_activated' ? 'filter-active' : ''}`}
            onClick={handleFilter}>
              Active
              <i
                className = {`bi ms-2 sort-button sort_date_account_activated ${getArrowClass('date_account_activated')}`}
                onClick   = {handleSort}>
              </i>
          </label>
          <label
            className = {`col-1 text-center filter-button filter_date_account_inactivated ${blankDateFilter === 'date_account_inactivated' ? 'filter-active' : ''}`}
            onClick={handleFilter}>
              Inactive
              <i
                className = {`bi ms-2 sort-button sort_date_account_inactivated ${getArrowClass('date_account_inactivated')}`}
                onClick   = {handleSort}>
              </i>
          </label>
          <label
            className = 'col-1 text-centern'>
              Exist?
              <i
                className = {`bi ms-2 sort-button sort_existing_user ${getArrowClass('existing_user')}`}
                onClick   = {handleSort}>
              </i>
          </label>
          <label className='col-1'></label>
        </div>
      </nav>

      {/* Modal deletion confirmation window */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="deleteModalLabel">Delete Record</h1>
              <button type="button" id="deleteModalCloseButton" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
             {selectedAccountId !== null && (
                <p>Do you want to delete the record with ID {selectedAccountId}?</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick = {handleDeleteConfirm}>Yes</button>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No</button>
            </div>
          </div>
        </div>
      </div>

      <div className='container-fluid'>
        {/* List of accounts */}
        {accounts.map((account, index) => (
          <form onSubmit={(event) => handleFormSubmit(event, index)} key={account.id}>
            <div className={`form-group row g-2 align-items-center record record_${index}`}>
              <div className='col-2'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`username_${account.id}`}
                  name          = 'username'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].username}
                  required
                />
              </div>

              <div className='col-2'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`email_${account.id}`}
                  name          = 'email'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].email}
                  required
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm text-end ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`date_requested_${account.id}`}
                  name          = 'date_requested'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].date_requested}
                  required
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm text-end ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`date_au_created_${account.id}`}
                  name          = 'date_au_created'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].date_au_created}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm text-end ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`date_training_assigned_${account.id}`}
                  name          = 'date_training_assigned'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].date_training_assigned}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm text-end ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`date_account_created_${account.id}`}
                  name          = 'date_account_created'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].date_account_created}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm text-end ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`date_account_activated_${account.id}`}
                  name          = 'date_account_activated'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].date_account_activated}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = {`form-control input-sm text-end ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                  id            = {`date_account_inactivated_${account.id}`}
                  name          = 'date_account_inactivated'
                  onChange      = {(event) => handleInputChange(event, index)}
                  value         = {formDatas[index].date_account_inactivated}
                />
              </div>

              <div className = "col-auto">
                <div className = "input-group-text">
                  <input
                    className = {`form-check-input input-sm ${formDatas[index].date_account_inactivated ? 'inactive' : ''}`}
                    type      = "checkbox"
                    id        = {'existing_user_' + account.id}
                    name      = 'existing_user'
                    onChange  = {(event) => handleInputChange(event, index)}
                    checked   = {formDatas[index].existing_user}
                    value     = {formDatas[index].existing_user}
                  />
                </div>
              </div>

              <div className = 'col-1 text-center btn_submit'>
                <i
                  className = "bi bi-check-lg"
                  id        = {`submit_${account.id}`}
                  onClick   = {(event) => handleFormSubmit(event, index)}>
                </i>
              </div>

              <div className='col-auto btn_delete' data-bs-toggle="modal" data-bs-target="#deleteModal" key={account.id}>
                <i
                  className = "bi bi-trash3"
                  id        = {`delete_${account.id}`}
                  onClick={(event) => handleDeleteClick(event, account.id)}>
                </i>
              </div>
            </div>
          </form>
        ))}

      {/* New line */}
      <form onSubmit={handleNewFormSubmit}>
        <div className = "row g-2 align-items-center">
          <div className = 'col-2'>
            <input
              type        = 'text'
              className   = 'form-control'
              id          = 'username'
              name        = 'username'
              onChange    = {handleNewFormInputChange}
              value       = {newFormData.username}
              required
            />
          </div>

          <div className='col-2'>
              <input
                type          = 'text'
                className     = 'form-control'
                id            = 'email'
                name          = 'email'
                onChange      = {handleNewFormInputChange}
                value         = {newFormData.email}
                required
              />
            </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = 'form-control text-end'
                  id            = 'date_requested'
                  name          = 'date_requested'
                  onChange      = {handleNewFormInputChange}
                  value         = {newFormData.date_requested}
                  required
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = 'form-control text-end'
                  id            = 'date_au_created'
                  name          = 'date_au_created'
                  onChange      = {handleNewFormInputChange}
                  value         = {newFormData.date_au_created}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = 'form-control text-end'
                  id            = 'date_training_assigned'
                  name          = 'date_training_assigned'
                  onChange      = {handleNewFormInputChange}
                  value         = {newFormData.date_training_assigned}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = 'form-control text-end'
                  id            = 'date_account_created'
                  name          = 'date_account_created'
                  onChange      = {handleNewFormInputChange}
                  value         = {newFormData.date_account_created}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = 'form-control text-end'
                  id            = 'date_account_activated'
                  name          = 'date_account_activated'
                  onChange      = {handleNewFormInputChange}
                  value         = {newFormData.date_account_activated}
                />
              </div>

              <div className='col-1'>
                <input
                  type          = 'text'
                  className     = 'form-control text-end'
                  id            = 'date_account_inactivated'
                  name          = 'date_account_inactivated'
                  onChange      = {handleNewFormInputChange}
                  value         = {newFormData.date_account_inactivated}
                />
              </div>

          <div className = "col-auto">
            <div className = "input-group-text">
              <input
                className = "form-check-input mt-0"
                type      = "checkbox"
                id        = 'existing_user'
                name      = 'existing_user'
                onChange  = {handleNewFormInputChange}
                checked   = {newFormData.existing_user}
                value     = {newFormData.existing_user}
              />
            </div>
          </div>

          <div className = 'col-1 text-center btn_submit'>
            <i
              className = "bi bi-check-lg"
              id        = 'submit'
              onClick   = {handleNewFormSubmit}>
            </i>
          </div>

        </div>
      </form>

      </div>
    </div>
  )
}

export default App;
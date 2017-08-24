import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Select from 'react-select';


class LabelSelector extends Component {
    constructor(props){
        super(props);
		
		this.state = {
			hint: this.props.hint,
			label: this.props.label,
			multi: this.props.multi,
			multiValue: this.props.multiValue,
			options: this.props.options,
			selected: this.props.selected
		};
		
		this.handleOnChange = this.handleOnChange.bind(this);
		this.toggleMulti = this.toggleMulti.bind(this);
    }

	handleOnChange (value) {
		const { multi } = this.state;
		if (multi) {
			this.setState({ multiValue: value });
			this.props.updateLabels(value);
		} else {
			this.setState({ selected: value });
			this.props.updateLabels([value]);
		}
	}

	toggleMulti (toMulti) {
		var value;
		if (toMulti) {
			value = this.state.multiValue;
		} else {
			value = [this.state.options[0]];
		}
		this.setState({ 
			selected: value[0], 
			multi: toMulti 
		});
		this.props.updateLabels(value);
	}

	render () {
		const { multi, multiValue, options, selected } = this.state;
		return (
			<div className="section">
				<h3 className="section-heading">{this.props.label}</h3>
				<Select.Creatable
					multi={multi}
					options={options}
					onChange={this.handleOnChange}
					value={multi ? multiValue : selected}
				/>
				<div className="hint">{this.props.hint}</div>
				<div className="checkbox-list">
					<label className="checkbox">
						<input
							type="radio"
							className="checkbox-control"
							checked={multi}
							onChange={() => this.toggleMulti(true)}
						/>
						<span className="checkbox-label">Multiselect</span>
					</label>
					<label className="checkbox">
						<input
							type="radio"
							className="checkbox-control"
							checked={!multi}
							onChange={() => this.toggleMulti(false)}
						/>
						<span className="checkbox-label">Single Value</span>
					</label>
				</div>
			</div>
		);
	}
};
	
LabelSelector.propTypes = {
	hint: PropTypes.string,
	label: PropTypes.string,
	multi: React.PropTypes.bool.isRequired,
	multiValue: PropTypes.array.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    selected: PropTypes.any
};

LabelSelector.defaultProps = {
	hint: undefined,
	label: undefined,
	multi: true,
	multiValue: [],
	options: [
		{ value: 'R', label: 'Red' },
		{ value: 'G', label: 'Green' },
		{ value: 'B', label: 'Blue' }
	],
	selected: undefined
}


export default LabelSelector;
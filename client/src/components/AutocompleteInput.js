import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiChevronDown } from 'react-icons/fi';

const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-height: 42px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  background: white;
  padding: 0.25rem 2rem 0.25rem 0.75rem;
  cursor: text;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: var(--gray-400);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  flex: 1;
  min-height: 24px;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--primary-color);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Input = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--gray-700);
  flex: 1;
  min-width: 100px;
  padding: 0.25rem 0;

  &::placeholder {
    color: var(--gray-400);
  }
`;

const DropdownIcon = styled(FiChevronDown).withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  position: absolute;
  right: 0.75rem;
  color: var(--gray-400);
  pointer-events: none;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--gray-300);
  border-top: none;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  box-shadow: var(--shadow);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const DropdownItem = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-100);
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--gray-50);
  }

  &:last-child {
    border-bottom: none;
  }

  &.selected {
    background: var(--primary-color);
    color: white;
  }
`;

const NoResults = styled.div`
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--gray-500);
  text-align: center;
  font-style: italic;
`;

const AutocompleteInput = ({ 
  options = [], 
  selectedValues = [], 
  onSelectionChange, 
  placeholder = "Tapez pour rechercher...",
  getOptionLabel = (option) => option.name || option.label || option,
  getOptionValue = (option) => option.id || option.value || option,
  multiple = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(options)) {
      setFilteredOptions([]);
      return;
    }
    
    const filtered = options.filter(option => 
      getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [inputValue, options, getOptionLabel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleOptionSelect = (option) => {
    const optionValue = getOptionValue(option);
    
    if (multiple) {
      if (!Array.isArray(selectedValues)) {
        onSelectionChange([option]);
        return;
      }
      
      const isAlreadySelected = selectedValues.some(value => 
        getOptionValue(value) === optionValue
      );
      
      if (!isAlreadySelected) {
        const newSelection = [...selectedValues, option];
        onSelectionChange(newSelection);
      }
    } else {
      onSelectionChange([option]);
      setIsOpen(false);
    }
    
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleTagRemove = (optionToRemove) => {
    if (!Array.isArray(selectedValues)) return;
    
    const newSelection = selectedValues.filter(value => 
      getOptionValue(value) !== getOptionValue(optionToRemove)
    );
    onSelectionChange(newSelection);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const availableOptions = Array.isArray(filteredOptions) ? filteredOptions.filter(option => 
    !selectedValues.some(selected => 
      getOptionValue(selected) === getOptionValue(option)
    )
  ) : [];

  return (
    <AutocompleteContainer ref={containerRef}>
      <InputContainer onClick={handleContainerClick}>
        <TagsContainer>
          {Array.isArray(selectedValues) && selectedValues.map((value) => (
            <Tag key={getOptionValue(value)}>
              {getOptionLabel(value)}
              <RemoveTagButton onClick={(e) => {
                e.stopPropagation();
                handleTagRemove(value);
              }}>
                <FiX size={12} />
              </RemoveTagButton>
            </Tag>
          ))}
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={(!Array.isArray(selectedValues) || selectedValues.length === 0) ? placeholder : ""}
          />
        </TagsContainer>
        <DropdownIcon isOpen={isOpen} />
      </InputContainer>

      {isOpen && (
        <DropdownList>
          {availableOptions.length > 0 ? (
            availableOptions.map((option) => (
              <DropdownItem
                key={getOptionValue(option)}
                onClick={() => handleOptionSelect(option)}
              >
                {getOptionLabel(option)}
              </DropdownItem>
            ))
          ) : (
            <NoResults>
              {inputValue ? 'Aucun résultat trouvé' : 'Aucune option disponible'}
            </NoResults>
          )}
        </DropdownList>
      )}
    </AutocompleteContainer>
  );
};

export default AutocompleteInput;
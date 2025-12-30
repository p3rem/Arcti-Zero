INSERT INTO emission_factors (category, subcategory, unit, factor_value, source) VALUES
-- Electricity (India Grid & Alternatives)
('electricity', 'grid_india', 'kWh', 0.82, 'CEA India + EPA'),
('electricity', 'renewable', 'kWh', 0.05, 'IPCC Lifecycle'),
('electricity', 'diesel_generator', 'kWh', 0.69, 'EPA Diesel Combustion'),

-- Transport (Distance-based)
('transport', 'petrol_car', 'km', 0.192, 'EPA Vehicle Averages'),
('transport', 'diesel_car', 'km', 0.171, 'EPA Vehicle Averages'),
('transport', 'two_wheeler', 'km', 0.075, 'India Transport Studies'),
('transport', 'bus', 'km', 0.082, 'EPA Public Transport'),
('transport', 'electric_vehicle', 'km', 0.04, 'EV Lifecycle (India Grid)'),

-- Fuel Consumption
('fuel', 'petrol', 'liter', 2.31, 'EPA Fuel Combustion'),
('fuel', 'diesel', 'liter', 2.68, 'EPA Fuel Combustion'),
('fuel', 'lpg', 'kg', 1.51, 'IPCC Combustion'),
('fuel', 'cng', 'kg', 2.75, 'IPCC Combustion'),

-- Waste
('waste', 'organic', 'kg', 0.25, 'IPCC Waste Management'),
('waste', 'paper', 'kg', 1.10, 'EPA Waste Factors'),
('waste', 'plastic', 'kg', 2.50, 'EPA Waste Factors'),
('waste', 'mixed_municipal', 'kg', 0.45, 'IPCC Waste Averages'),

-- Materials (Supply Chain)
('supply_chain', 'steel', 'kg', 1.85, 'IPCC Industrial'),
('supply_chain', 'cement', 'kg', 0.93, 'IPCC Cement Production'),
('supply_chain', 'aluminum', 'kg', 8.24, 'IPCC Industrial Lifecycle');

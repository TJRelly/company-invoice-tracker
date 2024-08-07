\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'), 
         ('tesla','Tesla','self driving cars');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

CREATE TABLE industries (
    code VARCHAR PRIMARY KEY,
    industry VARCHAR NOT NULL
);

CREATE TABLE company_industries (
    company_code VARCHAR NOT NULL REFERENCES companies(code),
    industry_code VARCHAR NOT NULL REFERENCES industries(code),
    PRIMARY KEY (company_code, industry_code)
);

-- Insert industries
INSERT INTO industries (code, industry) VALUES 
('auto', 'Automoble'),
('tech', 'Technology'),
('fin', 'Finance');

-- Associate companies with industries
INSERT INTO company_industries (company_code, industry_code) VALUES 
('tesla', 'tech'),
('tesla', 'fin'),
('tesla', 'auto'),
('apple', 'tech'),
('apple', 'fin'),
('ibm', 'tech');

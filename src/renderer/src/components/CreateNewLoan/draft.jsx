 <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submitAddLoan()
                }}
              >
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <Dropdown
                      name="productId"
                      style={{ width: '100%', minWidth: '100%', padding: '0' }}
                      value={addInputs.productId}
                      options={productList}
                      optionLabel="refProductName"
                      optionValue="refProductId"
                      onChange={(e) => {
                        handleInput(e)
                      }}
                      filter
                      placeholder="Select Product"
                      required
                    />
                    <label>Select Product</label>
                  </FloatLabel>

                  <FloatLabel style={{ width: '100%' }}>
                    <InputNumber
                      style={{ width: '100%' }}
                      inputId="currency-india"
                      id="refLoanAmount"
                      name="refLoanAmount"
                      useGrouping={true}
                      mode="currency"
                      currency="INR"
                      currencyDisplay="symbol"
                      locale="en-IN"
                      value={addInputs.refLoanAmount}
                      onChange={(e: any) => {
                        if (addInputs.refisInterest) {
                          const val =
                            parseFloat(e.value) -
                            parseFloat(e.value) *
                              (parseFloat(addInputs.productInterest) / 100) *
                              parseFloat(addInputs.productDuration)
                          setAddInputs({
                            ...addInputs,
                            ['refLoanAmount']: e.value,
                            ['refLoanBalance']: val
                          })
                        } else {
                          setAddInputs({
                            ...addInputs,
                            ['refLoanAmount']: e.value,
                            ['refLoanBalance']: e.value
                          })
                        }
                      }}
                      required
                    />
                    <label htmlFor="refLoanAmount">Enter Loan Amount</label>
                  </FloatLabel>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <Calendar
                      dateFormat="dd/mm/yy"
                      name="refrepaymentStartDate"
                      style={{ width: '100%' }}
                      value={addInputs.refrepaymentStartDate}
                      id="refrepaymentStartDate"
                      onChange={(e: any) => {
                        handleInput(e)
                      }}
                      required
                    />
                    <label htmlFor="refrepaymentStartDate">Repayement Start Date</label>
                  </FloatLabel>

                  <FloatLabel style={{ width: '100%' }}>
                    <Dropdown
                      id="refPaymentType"
                      name="refPaymentType"
                      style={{ width: '100%', minWidth: '100%', padding: '0' }}
                      value={addInputs.refPaymentType}
                      options={paymentType}
                      optionLabel="label"
                      optionValue="id"
                      placeholder="Select Payment Type"
                      onChange={(e) => {
                        handleInput(e)
                      }}
                      required
                    />
                    <label htmlFor="refPaymentType">Choose Payment type</label>
                  </FloatLabel>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '100%' }}>
                    <Dropdown
                      name="refBankId"
                      style={{ width: '100%', minWidth: '100%' }}
                      value={addInputs.refBankId}
                      options={allBankAccountList}
                      optionLabel="refBankName"
                      optionValue="refBankId"
                      onChange={(e: any) => handleInput(e)}
                      required
                      id="refBankId"
                    />
                    <label htmlFor="refBankId"> Choose Bank</label>
                  </FloatLabel>

                  <div
                    className="flex flex-row justify-start align-items-center w-[100%]"
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'start',
                      flexDirection: 'column'
                    }}
                  >
                    <label className="w-[30%]">Is Interest First:</label>
                    <div
                      style={{
                        display: 'flex',
                        width: '30%',
                        alignItems: 'center',
                        justifyContent: 'start',
                        gap: '20px'
                      }}
                    >
                      <div>
                        <input
                          type="radio"
                          id="interestFirstYes"
                          name="isInterestFirst"
                          checked={addInputs.refisInterest === true}
                          onChange={() => {
                            if (addInputs.refLoanAmount && addInputs.productId) {
                              const val =
                                parseFloat(addInputs.refLoanAmount) -
                                parseFloat(addInputs.refLoanAmount) *
                                  (parseFloat(addInputs.productInterest) / 100) *
                                  parseFloat(addInputs.productDuration)
                              setAddInputs({
                                ...addInputs,
                                ['refisInterest']: true,
                                ['refInterestMonth']: 1,
                                ['refLoanBalance']: val
                              })
                            } else {
                              setAddInputs({ ...addInputs, ['refisInterest']: true })
                            }
                          }}
                          required
                        />
                        <label htmlFor="interestFirstYes">Yes</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          id="interestFirstNo"
                          name="isInterestFirst"
                          checked={addInputs.refisInterest === false}
                          onChange={() => {
                            if (addInputs.refLoanAmount && addInputs.productId) {
                              const val = parseFloat(addInputs.refLoanAmount)
                              setAddInputs({
                                ...addInputs,
                                ['refisInterest']: false,
                                ['refInterestMonth']: 0,
                                ['refLoanBalance']: val
                              })
                            } else {
                              setAddInputs({ ...addInputs, ['refisInterest']: false })
                            }
                          }}
                          required
                        />
                        <label htmlFor="interestFirstNo">No</label>
                      </div>
                    </div>
                    {/* {
                      addInputs.refisInterest && <div className="w-[50%]">
                        <div className="w-full">
                          <FloatLabel >
                            <InputNumber
                              style={{ width: "100%" }}
                              id="refInterestMonth"
                              name="refInterestMonth"
                              useGrouping={true}
                              value={addInputs.refInterestMonth}
                              onChange={(e) => {
                                const loanAmount = addInputs.refLoanAmount || 0;
                                const interest = parseFloat(addInputs.productInterest) || 0;
                                const duration = e.value || 0;

                                if (loanAmount && addInputs.productId) {
                                  const totalInterest = loanAmount * (interest / 100) * duration;
                                  const loanBalance = loanAmount - totalInterest;

                                  setAddInputs({
                                    ...addInputs,
                                    refInterestMonth: duration,
                                    refLoanBalance: loanBalance
                                  });
                                }
                              }}

                              required />
                            <label htmlFor="refLoanBalance">Month</label>
                          </FloatLabel>
                        </div>
                      </div>
                    } */}
                  </div>
                </div>
                <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '35px' }}>
                  <FloatLabel style={{ width: '30%' }}>
                    <InputNumber
                      style={{ width: '100%' }}
                      id="refLoanBalance"
                      name="refLoanBalance"
                      useGrouping={true}
                      value={addInputs.refLoanBalance}
                      mode="currency"
                      currency="INR"
                      currencyDisplay="symbol"
                      locale="en-IN"
                      disabled
                      required
                    />
                    <label htmlFor="refLoanBalance">Loan Balance</label>
                  </FloatLabel>
                  <Dropdown
                    value={selectedLoanType}
                    required
                    onChange={(e: DropdownChangeEvent) => {
                      setLoanType(e.value)
                      loanOptions()
                    }}
                    options={loanType}
                    optionLabel="name"
                    placeholder="Select a Loan Type"
                    className="w-[30%]"
                  />
                  {selectedLoanType?.code !== 1 && (
                    <Dropdown
                      required
                      value={selectLoanOption}
                      onChange={(e: DropdownChangeEvent) => setSelectLoanOption(e.value)}
                      options={addLoanOption}
                      optionLabel="label"
                      placeholder="Select a Loan"
                      className="w-[30%]"
                    />
                  )}
                </div>

                {error.status ? (
                  <div style={{ marginTop: '20px', color: 'red' }}>{error.message}</div>
                ) : null}

                <div>
                  {newLoading ? (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '35px'
                      }}
                    >
                      <Button style={{ width: '20%' }} type="submit" icon="pi pi-spin pi-spinner" />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '35px'
                      }}
                    >
                      <Button style={{ width: '20%' }} type="submit" label="Submit" />
                    </div>
                  )}{' '}
                </div>
              </form>

import { useState, useEffect } from 'react'
import { dealService } from '@/services/api/dealService'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-toastify'

const ContactDetailModal = ({ isOpen, onClose, contact, onAddDeal }) => {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    if (isOpen && contact) {
      loadContactDeals()
    }
  }, [isOpen, contact])

  const loadContactDeals = async () => {
    if (!contact) return
    
    try {
      setLoading(true)
      const dealsData = await dealService.getByContactId(contact.Id)
      setDeals(dealsData)
    } catch (err) {
      toast.error("Failed to load contact deals")
    } finally {
      setLoading(false)
    }
  }

  const getTotalValue = () => {
    return deals.reduce((total, deal) => total + deal.value, 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStageColor = (stage) => {
    const colors = {
      lead: "default",
      qualified: "primary", 
      proposal: "secondary",
      negotiation: "warning",
      won: "success",
      lost: "danger"
    }
    return colors[stage.toLowerCase()] || "default"
  }

  if (!isOpen || !contact) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lifted w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-100 to-red-100 rounded-full flex items-center justify-center">
              <span className="text-coral-600 font-semibold text-xl">
                {contact.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-navy-500">{contact.name}</h2>
              <p className="text-gray-600">{contact.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <ApperIcon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "info", label: "Information", icon: "User" },
              { id: "deals", label: "Deals", icon: "TrendingUp" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-coral-500 text-coral-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4" />
                {tab.label}
                {tab.id === "deals" && (
                  <Badge variant="default" className="ml-1">
                    {deals.length}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
                  <p className="text-sm text-gray-700">{contact.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Phone</h3>
                  <p className="text-sm text-gray-700">{contact.phone || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Company</h3>
                  <p className="text-sm text-gray-700">{contact.company}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Added</h3>
                  <p className="text-sm text-gray-700">
                    {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <Badge key={index} variant="primary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-navy-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-navy-500 mb-4">Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-navy-500">{deals.length}</p>
                    <p className="text-sm text-gray-600">Total Deals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-500">{formatCurrency(getTotalValue())}</p>
                    <p className="text-sm text-gray-600">Total Value</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "deals" && (
            <div className="space-y-6">
              {/* Add Deal Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-navy-500">Deals</h3>
                <Button onClick={() => onAddDeal(contact)}>
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </div>

              {/* Deals List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-coral-500 border-t-transparent mx-auto" />
                  <p className="text-gray-500 mt-2">Loading deals...</p>
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="Target" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No deals yet for this contact</p>
                  <Button
                    variant="ghost"
                    onClick={() => onAddDeal(contact)}
                    className="mt-2"
                  >
                    Create first deal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div key={deal.Id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-navy-500">{deal.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{deal.notes}</p>
                        </div>
                        <Badge variant={getStageColor(deal.stage)} className="ml-4">
                          {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className="font-medium text-navy-500">
                          {formatCurrency(deal.value)}
                        </span>
                        <span>
                          Updated {formatDistanceToNow(new Date(deal.lastContact), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ContactDetailModal